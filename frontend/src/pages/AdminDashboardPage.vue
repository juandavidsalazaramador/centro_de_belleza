
<template>
  <q-page class="admin-dashboard">
    <div class="dashboard-header">
      <div>
        <div class="eyebrow">GLOW STUDIO</div>
        <h1>Panel administrativo</h1>
        <p>Gestiona las citas y la operación de tu estudio.</p>
      </div>
      <q-btn
        outline
        no-caps
        label="Cerrar sesión"
        @click="cerrarSesion"
      />
    </div>

    <div class="welcome-card">
      <div class="welcome-icon">
        <q-icon name="spa" size="32px" />
      </div>
      <div>
        <div class="welcome-title">Bienvenida al área administrativa</div>
        <div class="welcome-text">
          Hola, {{ usuario?.nombre || usuario?.username || 'Administradora' }}.
          Desde aquí puedes consultar las citas de Glow Studio.
        </div>
      </div>
    </div>

    <div class="section-heading">
      <div>
        <h2>Agenda de citas</h2>
        <p>Consulta y actualiza el estado de las reservas.</p>
      </div>
      <q-btn
        color="primary"
        outline
        no-caps
        icon="refresh"
        label="Actualizar"
        :loading="cargando"
        @click="cargarCitas"
      />
    </div>

    <q-banner
      v-if="error"
      class="bg-red-1 text-negative q-mb-md rounded-borders"
    >
      {{ error }}
    </q-banner>

    <div class="stats-grid">
      <div class="stat-card">
        <span>Total de citas</span>
        <strong>{{ citas.length }}</strong>
      </div>
      <div class="stat-card">
        <span>Programadas</span>
        <strong>{{ contarEstado('Programada') }}</strong>
      </div>
      <div class="stat-card">
        <span>Completadas</span>
        <strong>{{ contarEstado('Completada') }}</strong>
      </div>
      <div class="stat-card">
        <span>Canceladas</span>
        <strong>{{ contarEstado('Cancelada') }}</strong>
      </div>
    </div>

    <q-card flat bordered class="appointments-card">
      <q-card-section v-if="cargando" class="text-center q-pa-xl">
        <q-spinner color="primary" size="36px" />
        <p class="q-mt-md">Cargando citas...</p>
      </q-card-section>

      <q-card-section
        v-else-if="citas.length === 0"
        class="text-center q-pa-xl"
      >
        <q-icon name="event_available" size="48px" color="grey-5" />
        <div class="text-h6 q-mt-md">Todavía no hay citas</div>
        <p class="text-grey-7">
          Cuando los clientes reserven, aparecerán aquí.
        </p>
      </q-card-section>

      <q-markup-table v-else flat wrap-cells>
        <thead>
          <tr>
            <th class="text-left">Fecha y hora</th>
            <th class="text-left">Cliente</th>
            <th class="text-left">Servicio</th>
            <th class="text-left">Estilista</th>
            <th class="text-left">Precio</th>
            <th class="text-left">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="cita in citas" :key="cita._id">
            <td>
              <div>{{ cita.date }}</div>
              <div class="text-grey-7">
                {{ cita.timeStart }} - {{ cita.timeEnd }}
              </div>
            </td>

            <td>
              {{ cita.userId?.nombre || '' }}
              {{ cita.userId?.apellido || '' }}
              <div class="text-grey-7">
                {{ cita.userId?.email || '' }}
              </div>
            </td>

            <td>
              {{ cita.serviceId?.name || 'Servicio no disponible' }}
            </td>

            <td>
              {{ cita.stylistId?.name || 'Sin estilista' }}
            </td>

            <td>{{ formatoPrecio(cita.price) }}</td>

            <td>
              <q-select
                v-if="
                  cita.status !== 'Completada' &&
                  cita.status !== 'Cancelada'
                "
                dense
                outlined
                emit-value
                map-options
                :model-value="cita.status"
                :options="opcionesEstado(cita.status)"
                :loading="actualizandoId === cita._id"
                :disable="actualizandoId === cita._id"
                @update:model-value="estado => cambiarEstado(cita, estado)"
                style="min-width: 150px"
              />

              <q-badge
                v-else
                :color="
                  cita.status === 'Completada' ? 'positive' : 'negative'
                "
                :label="cita.status"
              />
            </td>

            <td class="text-center">
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                aria-label="Eliminar cita"
                :loading="eliminandoId === cita._id"
                :disable="eliminandoId === cita._id"
                @click="eliminarCita(cita)"
              >
                <q-tooltip>Eliminar cita</q-tooltip>
              </q-btn>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
  </q-page>
</template>


<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'

import { API_URL } from '../services/api.js'
const router = useRouter()
const $q = useQuasar()

const citas = ref([])
const cargando = ref(false)
const error = ref('')
const actualizandoId = ref('')
const eliminandoId = ref('')

const usuario = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('glow_user') || 'null')
  } catch {
    return null
  }
})

const estados = [
  { label: 'Programada', value: 'Programada' },
  { label: 'En proceso', value: 'En proceso' },
  { label: 'Completada', value: 'Completada' },
  { label: 'Cancelada', value: 'Cancelada' },
]

function opcionesEstado(estadoActual) {
  if (estadoActual === 'Completada' || estadoActual === 'Cancelada') {
    return estados.filter(opcion => opcion.value === estadoActual)
  }

  if (estadoActual === 'Programada') {
    return estados.filter(opcion =>
      ['Programada', 'En proceso', 'Cancelada'].includes(opcion.value),
    )
  }

  if (estadoActual === 'En proceso') {
    return estados.filter(opcion =>
      ['En proceso', 'Completada', 'Cancelada'].includes(opcion.value),
    )
  }

  return estados
}

function encabezados() {
  const token = localStorage.getItem('glow_token')
  return { Authorization: `Bearer ${token}` }
}

function contarEstado(estado) {
  return citas.value.filter(cita => cita.status === estado).length
}

function formatoPrecio(precio) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(precio || 0)
}

async function cargarCitas() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await axios.get(`${API_URL}/citas/admin/todas`, {
      headers: encabezados(),
    })

    citas.value = respuesta.data
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      cerrarSesion()
      return
    }

    error.value =
      err.response?.data?.message || 'No fue posible cargar las citas.'
  } finally {
    cargando.value = false
  }
}

async function cambiarEstado(cita, estado) {
  if (
    !estado ||
    estado === cita.status ||
    cita.status === 'Completada' ||
    cita.status === 'Cancelada'
  ) {
    return
  }

  actualizandoId.value = cita._id
  error.value = ''

  try {
    const respuesta = await axios.patch(
      `${API_URL}/citas/${cita._id}/estado`,
      { status: estado },
      { headers: encabezados() },
    )

    cita.status = respuesta.data.cita.status

    $q.notify({
      type: 'positive',
      message: 'Estado de la cita actualizado.',
    })
  } catch (err) {
    error.value =
      err.response?.data?.message || 'No se pudo actualizar el estado.'
  } finally {
    actualizandoId.value = ''
  }
}

async function eliminarCita(cita) {
  const confirmado = await new Promise(resolve => {
    $q.dialog({
      title: 'Eliminar cita',
      message: `¿Seguro que deseas eliminar la cita de ${
        cita.userId?.nombre || 'este cliente'
      } del ${cita.date}? Esta acción no se puede deshacer.`,
      cancel: {
        label: 'No, conservar',
        flat: true,
        noCaps: true,
      },
      ok: {
        label: 'Sí, eliminar',
        color: 'negative',
        noCaps: true,
      },
      persistent: true,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false))
  })

  if (!confirmado) return

  eliminandoId.value = cita._id
  error.value = ''

  try {
    await axios.delete(`${API_URL}/citas/${cita._id}`, {
      headers: encabezados(),
    })

    citas.value = citas.value.filter(item => item._id !== cita._id)

    $q.notify({
      type: 'positive',
      message: 'Cita eliminada correctamente.',
    })
  } catch (err) {
    console.error('Error al eliminar cita:', err)

    const mensaje =
      err.response?.data?.message || 'No se pudo eliminar la cita.'
    error.value = mensaje

    $q.notify({
      type: 'negative',
      message: mensaje,
    })
  } finally {
    eliminandoId.value = ''
  }
}

function cerrarSesion() {
  localStorage.removeItem('glow_token')
  localStorage.removeItem('glow_user')
  router.replace('/admin/login')
}

onMounted(() => {
  if (usuario.value?.role !== 'admin' || !localStorage.getItem('glow_token')) {
    cerrarSesion()
    return
  }

  cargarCitas()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100%;
  padding: 32px;
  background: #faf7f6;
  color: #382b30;
}

.dashboard-header,
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 26px;
}

.eyebrow {
  color: #b76e79;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
}

h1 {
  margin: 8px 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(27px, 4vw, 38px);
  font-weight: 400;
}

h2 {
  margin: 0 0 7px;
  font-size: 23px;
  font-weight: 500;
}

p {
  margin: 0;
  color: #81747a;
}

.welcome-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px;
  margin-bottom: 32px;
  border: 1px solid #ead5d2;
  border-radius: 14px;
  background: #fff;
}

.welcome-icon {
  display: grid;
  flex-shrink: 0;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 12px;
  background: #f7e9e8;
  color: #b76e79;
}

.welcome-title {
  margin-bottom: 6px;
  font-size: 17px;
  font-weight: 600;
}

.welcome-text {
  color: #81747a;
  line-height: 1.6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  border: 1px solid #eadfdd;
  border-radius: 12px;
  background: white;
}

.stat-card span {
  display: block;
  color: #81747a;
  font-size: 13px;
}

.stat-card strong {
  display: block;
  margin-top: 10px;
  font-size: 29px;
  font-weight: 500;
}

.appointments-card {
  overflow: hidden;
  border-color: #eadfdd;
  border-radius: 14px;
  background: white;
}

@media (max-width: 850px) {
  .admin-dashboard {
    padding: 20px 14px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .appointments-card {
    overflow-x: auto;
  }

  .dashboard-header,
  .section-heading {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
