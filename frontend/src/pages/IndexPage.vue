
<template>
  <q-page class="glow-page">
    <header class="topbar">
      <div class="brand">
        <span class="brand-icon">✿</span>
        <span>Glow <strong>Studio</strong></span>
      </div>

      <nav class="desktop-nav">
        <a href="#inicio" @click.prevent="irASeccion('inicio')">Inicio</a>
        <a href="#servicios" @click.prevent="irASeccion('servicios')">Servicios</a>
        <a href="#nosotros" @click.prevent="irASeccion('nosotros')">Nosotros</a>
      </nav>

      <template v-if="!usuarioActual">
        <q-btn
          label="Iniciar sesión"
          unelevated
          no-caps
          class="login-btn"
          @click="mostrarLogin = true"
        />
      </template>

      <div v-else class="user-menu">
        <span class="user-name">
          {{ usuarioActual.nombre }} {{ usuarioActual.apellido || '' }}
        </span>
        <q-btn
          label="Cerrar sesión"
          flat
          no-caps
          class="login-btn"
          @click="cerrarSesion"
        />
      </div>
    </header>

    <section id="inicio" class="hero">
      <div class="hero-content">
        <div class="eyebrow">
          <span></span>
          TU MOMENTO, TU BELLEZA
        </div>

        <h1>
          Resalta tu belleza,<br />
          <em>brilla a tu manera.</em>
        </h1>

        <p>
          Un espacio creado para consentirte, renovar tu energía
          y hacer que te sientas increíble.
        </p>

        <div class="hero-actions">
          <q-btn
            label="Descubrir servicios"
            unelevated
            no-caps
            class="primary-btn"
            @click="irASeccion('servicios')"
          />
          <a
            href="#nosotros"
            class="text-link"
            @click.prevent="irASeccion('nosotros')"
          >
            Conócenos ↗
          </a>
        </div>

        <div class="hero-note">
          <span class="note-star">✦</span>
          <span>Tu belleza merece un momento especial.</span>
        </div>
      </div>

      <div class="hero-visual">
        <div class="photo-frame">
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1100&q=85"
            alt="Interior elegante de un salón de belleza"
          />
          <div class="photo-label">
            <span>GLOW EXPERIENCE</span>
            <strong>Un lugar para ti.</strong>
          </div>
        </div>

        <div class="floating-badge">
          <span>✿</span>
          <div>
            <strong>Beauty &amp; Care</strong>
            <small>Tu mejor versión</small>
          </div>
        </div>

        <span class="decor decor-one">✳</span>
        <span class="decor decor-two">✧</span>
      </div>
    </section>

    <section id="servicios" class="services-section">
      <div class="section-heading">
        <span class="section-kicker">LO QUE TENEMOS PARA TI</span>
        <h2>Un cuidado que <em>se nota.</em></h2>
        <p>Descubre experiencias pensadas para hacerte sentir bien.</p>
      </div>

      <div class="service-grid">
        <article
          v-for="servicio in servicios"
          :key="servicio._id"
          class="service-card"
        >
          <div class="service-icon">✧</div>
          <span class="service-category">{{ servicio.category }}</span>
          <h3>{{ servicio.name }}</h3>
          <p>{{ servicio.description }}</p>

          <div class="service-details">
            <strong>{{ formatoPrecio(servicio.price) }}</strong>
            <span>{{ servicio.duration }} minutos</span>
          </div>

          <q-btn
            label="Reservar cita"
            class="full-width q-mt-md"
            color="primary"
            unelevated
            no-caps
            @click="reservarServicio(servicio)"
          />
        </article>

        <p v-if="cargando" class="services-message">
          Cargando servicios...
        </p>

        <p v-else-if="errorServicios" class="services-message">
          No pudimos cargar los servicios. Intenta actualizar la página.
        </p>

        <p v-else-if="servicios.length === 0" class="services-message">
          Próximamente tendremos servicios disponibles.
        </p>
      </div>
    </section>

    <section id="nosotros" class="closing-section">
      <span>GLOW STUDIO · BELLEZA Y BIENESTAR</span>
      <h2>Hoy es un buen día para <em>brillar.</em></h2>
      <q-btn
        label="Quiero conocer más"
        unelevated
        no-caps
        class="primary-btn"
        @click="irASeccion('servicios')"
      />
    </section>

    <footer class="footer">
      <div class="brand">
        <span class="brand-icon">✿</span>
        <span>Glow <strong>Studio</strong></span>
      </div>
      <span>Un espacio para resaltar tu belleza.</span>
      <span>© 2026 Glow Studio</span>
      <router-link to="/admin/login" class="admin-link">
        Acceso administrativo
      </router-link>
    </footer>

    <!-- Diálogo de inicio de sesión y registro -->
    <q-dialog v-model="mostrarLogin">
      <q-card class="login-card">
        <q-card-section class="row items-center justify-between">
          <div class="brand">
            <span class="brand-icon">✿</span>
            <span>Glow <strong>Studio</strong></span>
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <h2>
            {{ modoFormulario === 'login' ? 'Bienvenido a Glow' : 'Crea tu cuenta' }}
          </h2>

          <p>
            {{
              modoFormulario === 'login'
                ? 'Ingresa para continuar y disfrutar nuestros servicios.'
                : 'Regístrate para comenzar a reservar tus servicios.'
            }}
          </p>

          <q-form @submit.prevent="enviarFormulario" class="q-gutter-md">
            <q-input
              v-if="modoFormulario === 'registro'"
              v-model="formulario.nombre"
              label="Nombre"
              outlined
              :rules="[v => !!v?.trim() || 'Escribe tu nombre']"
            />

            <q-input
              v-if="modoFormulario === 'registro'"
              v-model="formulario.apellido"
              label="Apellido"
              outlined
            />

            <q-input
              v-if="modoFormulario === 'registro'"
              v-model="formulario.telefono"
              label="Teléfono"
              outlined
            />

            <q-input
              v-model="formulario.email"
              label="Correo electrónico"
              type="email"
              autocomplete="email"
              outlined
              :rules="[
                v => !!v || 'Escribe tu correo',
                v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Correo no válido'
              ]"
            />

            <q-input
              v-model="formulario.password"
              label="Contraseña"
              :type="mostrarPassword ? 'text' : 'password'"
              :autocomplete="modoFormulario === 'login' ? 'current-password' : 'new-password'"
              outlined
              :rules="[
                v => !!v || 'Escribe tu contraseña',
                v =>
                  modoFormulario === 'login' ||
                  v.length >= 6 ||
                  'No puedes usar esta contraseña: debe tener al menos 6 caracteres.',
              ]"
            >
              <template #append>
                <q-icon
                  :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="mostrarPassword = !mostrarPassword"
                />
              </template>
            </q-input>

            <p v-if="errorAuth" class="text-negative">
              {{ errorAuth }}
            </p>
            <p v-if="mensajeAuth" class="text-positive">
              {{ mensajeAuth }}
            </p>

            <q-btn
              :label="procesando
                ? 'Espera...'
                : modoFormulario === 'login' ? 'Iniciar sesión' : 'Crear cuenta'"
              type="submit"
              class="primary-btn full-width"
              unelevated
              no-caps
              :loading="procesando"
              :disable="procesando"
            />

            <div class="text-center">
              <q-btn
                flat
                no-caps
                color="primary"
                :label="modoFormulario === 'login'
                  ? '¿No tienes cuenta? Regístrate'
                  : '¿Ya tienes cuenta? Inicia sesión'"
                @click="cambiarModo"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo para reservar una cita -->
    <q-dialog v-model="mostrarReserva" persistent>
      <q-card style="width: 500px; max-width: 95vw">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-h6">Reservar cita</div>
            <div v-if="servicioSeleccionado">
              {{ servicioSeleccionado.name }}
            </div>
            <div v-if="servicioSeleccionado" class="text-grey-7">
              {{ formatoPrecio(servicioSeleccionado.price) }}
              · {{ servicioSeleccionado.duration }} minutos
            </div>
          </div>

          <q-btn
            icon="close"
            flat
            round
            dense
            :disable="procesandoReserva"
            @click="mostrarReserva = false"
          />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="estilistaSeleccionado"
            :options="estilistas"
            option-value="_id"
            option-label="name"
            emit-value
            map-options
            label="Selecciona un estilista"
            outlined
            :loading="cargandoEstilistas"
            :disable="cargandoEstilistas || procesandoReserva"
          />

          <q-input
            v-model="fechaReserva"
            type="date"
            label="Fecha de la cita"
            :min="fechaLocal()"
            outlined
            :disable="procesandoReserva"
          />

          <q-input
            v-model="horaReserva"
            type="time"
            label="Hora de la cita"
            outlined
            :disable="procesandoReserva"
          />

          <q-input
            v-model="notasReserva"
            type="textarea"
            label="Notas adicionales (opcional)"
            outlined
            :disable="procesandoReserva"
          />

          <p v-if="errorReserva" class="text-negative">
            {{ errorReserva }}
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            no-caps
            v-close-popup
            :disable="procesandoReserva"
          />

          <q-btn
            label="Confirmar reserva"
            color="primary"
            unelevated
            no-caps
            :loading="procesandoReserva"
            :disable="cargandoEstilistas || procesandoReserva"
            @click="confirmarReserva"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const mostrarLogin = ref(false)
const usuarioActual = ref(
  JSON.parse(localStorage.getItem('glow_user') || 'null')
)

const servicios = ref([])
const cargando = ref(true)
const errorServicios = ref(false)

const modoFormulario = ref('login')
const mostrarPassword = ref(false)
const procesando = ref(false)
const errorAuth = ref('')
const mensajeAuth = ref('')

const formulario = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  password: '',
})

// Reservas
const mostrarReserva = ref(false)
const servicioSeleccionado = ref(null)
const estilistas = ref([])
const estilistaSeleccionado = ref('')
const fechaReserva = ref('')
const horaReserva = ref('')
const notasReserva = ref('')
const cargandoEstilistas = ref(false)
const procesandoReserva = ref(false)
const errorReserva = ref('')

const formatoPrecio = (precio) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(precio)

function irASeccion(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function fechaLocal() {
  const fecha = new Date()
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}


async function cargarServicios() {
  cargando.value = true
  errorServicios.value = false

  try {
    const respuesta = await axios.get(`${API_URL}/servicios`)
    const datos = respuesta.data

    console.log('Respuesta de servicios:', datos)

    servicios.value = Array.isArray(datos)
      ? datos
      : Array.isArray(datos.servicios)
        ? datos.servicios
        : Array.isArray(datos.data)
          ? datos.data
          : []

    if (servicios.value.length === 0) {
      console.warn('La API respondió, pero no se encontró una lista de servicios.')
    }
  } catch (error) {
    console.error('Error al cargar servicios:', error)
    errorServicios.value = true
  } finally {
    cargando.value = false
  }
}

function cambiarModo() {
  modoFormulario.value =
    modoFormulario.value === 'login' ? 'registro' : 'login'

  errorAuth.value = ''
  mensajeAuth.value = ''
  mostrarPassword.value = false
}

async function enviarFormulario() {
  errorAuth.value = ''
  mensajeAuth.value = ''
  procesando.value = true

  try {
    const esRegistro = modoFormulario.value === 'registro'

    const endpoint = esRegistro
      ? `${API_URL}/auth/register`
      : `${API_URL}/auth/login`

    const datos = esRegistro
      ? {
          nombre: formulario.value.nombre.trim(),
          apellido: formulario.value.apellido.trim(),
          telefono: formulario.value.telefono.trim(),
          email: formulario.value.email.trim().toLowerCase(),
          password: formulario.value.password,
        }
      : {
          email: formulario.value.email.trim().toLowerCase(),
          password: formulario.value.password,
        }

    const respuesta = await axios.post(endpoint, datos)
    const resultado = respuesta.data
    const token = resultado.token || resultado.accessToken

    if (!token) {
      throw new Error(
        'El servidor no devolvió el token de acceso.'
      )
    }

    localStorage.setItem('glow_token', token)

    const usuario =
      resultado.user ||
      resultado.usuario ||
      resultado.data?.user ||
      resultado.data?.usuario

    if (usuario) {
      localStorage.setItem('glow_user', JSON.stringify(usuario))
      usuarioActual.value = usuario
    }

    mensajeAuth.value = esRegistro
      ? 'Cuenta creada correctamente. Ya puedes iniciar sesión.'
      : 'Inicio de sesión exitoso.'

    if (esRegistro) {
      modoFormulario.value = 'login'
      formulario.value.password = ''
    } else {
      mostrarLogin.value = false
      formulario.value.password = ''
    }
  } catch (error) {
    console.error('Error de autenticación:', error)

    const erroresValidacion = error.response?.data?.errors

    errorAuth.value =
      erroresValidacion?.map?.((item) => item.msg).join('. ') ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'No fue posible completar la operación.'
  } finally {
    procesando.value = false
  }
}

function cerrarSesion() {
  localStorage.removeItem('glow_token')
  localStorage.removeItem('glow_user')

  usuarioActual.value = null
  formulario.value.password = ''
  errorAuth.value = ''
  mensajeAuth.value = ''
  mostrarLogin.value = false
  modoFormulario.value = 'login'
}

async function reservarServicio(servicio) {
  errorReserva.value = ''

  const token = localStorage.getItem('glow_token')

  if (!token) {
    mensajeAuth.value = 'Inicia sesión para reservar tu cita.'
    modoFormulario.value = 'login'
    mostrarLogin.value = true
    return
  }

  servicioSeleccionado.value = servicio
  estilistaSeleccionado.value = ''
  fechaReserva.value = fechaLocal()
  horaReserva.value = ''
  notasReserva.value = ''
  estilistas.value = []
  mostrarReserva.value = true
  cargandoEstilistas.value = true

  try {
    const respuesta = await axios.get(`${API_URL}/estilistas`)
    const datos = respuesta.data

    estilistas.value = Array.isArray(datos)
      ? datos
      : datos.estilistas || []

    if (estilistas.value.length === 0) {
      errorReserva.value =
        'No hay estilistas disponibles actualmente.'
    }
  } catch (error) {
    console.error('Error al cargar estilistas:', error)

    errorReserva.value =
      error.response?.data?.message ||
      'No se pudieron cargar los estilistas.'
  } finally {
    cargandoEstilistas.value = false
  }
}

async function confirmarReserva() {
  errorReserva.value = ''

  if (
    !servicioSeleccionado.value ||
    !estilistaSeleccionado.value ||
    !fechaReserva.value ||
    !horaReserva.value
  ) {
    errorReserva.value =
      'Completa el estilista, la fecha y la hora.'
    return
  }

  if (fechaReserva.value < fechaLocal()) {
    errorReserva.value = 'Selecciona una fecha válida.'
    return
  }

  const token = localStorage.getItem('glow_token')

  if (!token) {
    mostrarReserva.value = false
    mostrarLogin.value = true
    errorAuth.value = 'Inicia sesión para reservar tu cita.'
    return
  }

  procesandoReserva.value = true

  try {
    await axios.post(
      `${API_URL}/citas`,
      {
        stylistId: estilistaSeleccionado.value,
        serviceId: servicioSeleccionado.value._id,
        date: fechaReserva.value,
        timeStart: horaReserva.value,
        notes: notasReserva.value.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    mostrarReserva.value = false
    alert('¡Tu cita fue reservada correctamente!')
  } catch (error) {
    console.error('Error al reservar cita:', error)

    errorReserva.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.errors
        ?.map?.((item) => item.msg)
        .join('. ') ||
      'No se pudo reservar la cita. Verifica los datos e inténtalo de nuevo.'
  } finally {
    procesandoReserva.value = false
  }
}

onMounted(cargarServicios)
</script>

<style scoped>
.glow-page {
  --rose: #b76e79;
  --ink: #382b30;
  --muted: #81747a;
  color: var(--ink);
  background: #fffdfb;
  font-family: Arial, Helvetica, sans-serif;
}

.topbar {
  min-height: 82px;
  padding: 0 7%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid #f1e8e7;
  background: #fffdfb;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 23px;
  letter-spacing: -1px;
  white-space: nowrap;
}

.brand strong {
  color: var(--rose);
  font-weight: 500;
}

.brand-icon {
  color: var(--rose);
  font-size: 30px;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 34px;
}

.desktop-nav a,
.text-link {
  color: var(--ink);
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.desktop-nav a:hover,
.text-link:hover {
  color: var(--rose);
}

.login-btn {
  color: var(--rose);
  border: 1px solid #d9b0b5;
  border-radius: 5px;
  padding: 8px 18px;
}

.hero {
  min-height: 590px;
  padding: 75px 9% 85px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: 55px;
  overflow: hidden;
}

.eyebrow,
.section-kicker {
  color: var(--rose);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 3px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.eyebrow span {
  width: 24px;
  height: 1px;
  background: var(--rose);
}

.hero h1,
.section-heading h2,
.closing-section h2 {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
  letter-spacing: -1.7px;
}

.hero h1 {
  margin: 27px 0 22px;
  font-size: clamp(42px, 5vw, 66px);
  line-height: 1.13;
}

.hero h1 em,
.section-heading h2 em,
.closing-section h2 em {
  color: var(--rose);
  font-weight: 400;
}

.hero-content > p {
  max-width: 440px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.9;
}

.hero-actions {
  margin-top: 32px;
  display: flex;
  align-items: center;
  gap: 25px;
}

.primary-btn {
  min-height: 45px;
  padding: 0 23px;
  color: white;
  background: var(--rose);
  border-radius: 4px;
}

.primary-btn:hover {
  background: #9f5965;
}

.hero-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 55px;
  color: var(--muted);
  font-size: 11px;
}

.note-star {
  color: var(--rose);
  font-size: 20px;
}

.hero-visual {
  position: relative;
  max-width: 450px;
  width: 100%;
  margin: 0 auto;
}

.photo-frame {
  position: relative;
  height: 435px;
  overflow: hidden;
  background: #f0e4e0;
  border-radius: 48% 48% 4px 4px;
}

.photo-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-label {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: white;
  background: rgb(50 35 39 / 55%);
  backdrop-filter: blur(8px);
}

.photo-label span {
  font-size: 9px;
  letter-spacing: 2px;
}

.photo-label strong {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 22px;
  font-weight: 400;
}

.floating-badge {
  position: absolute;
  bottom: 55px;
  left: -45px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  background: white;
  box-shadow: 0 12px 35px #39242a17;
}

.floating-badge > span {
  color: var(--rose);
  font-size: 28px;
}

.floating-badge div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.floating-badge strong {
  font-size: 12px;
}

.floating-badge small {
  color: var(--muted);
  font-size: 10px;
}

.decor {
  position: absolute;
  color: #d6a4a8;
}

.decor-one {
  top: 10px;
  right: -25px;
  font-size: 42px;
}

.decor-two {
  top: 90px;
  left: -35px;
  font-size: 34px;
}

.services-section {
  padding: 85px 9%;
  background: #faf4f1;
}

.section-heading {
  text-align: center;
}

.section-heading h2,
.closing-section h2 {
  margin: 17px 0 12px;
  font-size: clamp(32px, 4vw, 45px);
}

.section-heading > p {
  color: var(--muted);
  font-size: 13px;
}

.service-grid {
  margin-top: 45px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.service-card {
  padding: 32px 27px;
  background: #fffdfb;
  border: 1px solid #f1e5e1;
  transition: transform 0.2s, box-shadow 0.2s;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px #4b30300b;
}

.service-icon {
  color: var(--rose);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 35px;
}

.service-card h3 {
  margin: 18px 0 12px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 21px;
  font-weight: 400;
}

.service-card p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}

.closing-section {
  padding: 85px 20px;
  text-align: center;
}

.closing-section > span {
  color: var(--muted);
  font-size: 9px;
  letter-spacing: 2px;
}

.closing-section h2 {
  margin-bottom: 25px;
}

.footer {
  padding: 25px 7%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  border-top: 1px solid #f1e8e7;
  color: var(--muted);
  font-size: 10px;
}

.footer .brand {
  color: var(--ink);
  font-size: 18px;
}

.footer .brand-icon {
  font-size: 23px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 8px;
  border-radius: 8px;
}

.login-card h2 {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
}

.login-card p {
  color: var(--muted);
  line-height: 1.7;
}

@media (max-width: 800px) {
  .topbar {
    padding: 18px 5%;
    flex-wrap: wrap;
  }

  .desktop-nav {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 25px;
  }

  .hero {
    grid-template-columns: 1fr;
    padding: 55px 7%;
    gap: 45px;
  }

  .hero-content {
    text-align: center;
  }

  .eyebrow,
  .hero-actions,
  .hero-note {
    justify-content: center;
  }

  .hero-content > p {
    margin-right: auto;
    margin-left: auto;
  }

  .hero-visual {
    max-width: 400px;
  }

  .photo-frame {
    height: 380px;
  }

  .service-grid {
    grid-template-columns: 1fr;
  }

  .services-section {
    padding: 65px 7%;
  }

  .floating-badge {
    left: -8px;
  }

  .footer {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 420px) {
  .brand {
    font-size: 20px;
  }

  .login-btn {
    padding: 6px 10px;
  }

  .hero h1 {
    font-size: 39px;
  }

  .hero-actions {
    flex-direction: column;
    gap: 18px;
  }

  .photo-frame {
    height: 320px;
  }
}


.user-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px 10px 8px 18px;
  background: #faf4f1;
  border: 1px solid #f0dfdc;
  border-radius: 50px;
}

.user-name {
  display: inline-block;
  color: #382b30;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

.user-menu .login-btn {
  margin: 0;
  padding: 8px 14px;
  background: #fffdfb;
  border: 1px solid #d9b0b5;
  border-radius: 24px;
  white-space: nowrap;
}

.user-menu .login-btn:hover {
  background: #f4e4e3;
}

@media (max-width: 600px) {
  .user-menu {
    gap: 8px;
    padding: 6px 8px 6px 12px;
  }

  .user-name {
    font-size: 12px;
  }

  .user-menu .login-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}

.admin-link {
  color: #9b777d;
  font-size: 10px;
  text-decoration: none;
  opacity: 0.8;
  transition: color 0.2s, opacity 0.2s;
}

.admin-link:hover {
  color: #b76e79;
  opacity: 1;
  text-decoration: underline;
}
</style>
