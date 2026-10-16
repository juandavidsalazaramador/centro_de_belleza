
<template>
  <q-page class="admin-page flex flex-center">
    <q-card class="admin-card">
      <div class="admin-decoration"></div>

      <q-card-section class="text-center q-pt-xl">
        <div class="admin-symbol">✿</div>
        <div class="brand-title">Glow <strong>Studio</strong></div>
        <div class="admin-label">ACCESO PRIVADO</div>
        <h1>Bienvenida de nuevo</h1>
        <p class="subtitle">
          Ingresa con tus credenciales administrativas.
        </p>
      </q-card-section>

      <q-card-section class="q-px-xl q-pb-xl">
        <q-form @submit.prevent="iniciarSesion" class="q-gutter-md">
          <q-input
            v-model.trim="formulario.usuario"
            label="Usuario admin"
            autocomplete="username"
            outlined
            :rules="[v => !!v || 'Ingresa tu usuario admin']"
          />

          <q-input
            v-model="formulario.password"
            label="Contraseña"
            :type="mostrarPassword ? 'text' : 'password'"
            autocomplete="current-password"
            outlined
            :rules="[v => !!v || 'Ingresa tu contraseña']"
          >
            <template #append>
              <q-icon
                :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="mostrarPassword = !mostrarPassword"
              />
            </template>
          </q-input>

          <q-banner v-if="error" class="bg-red-1 text-negative rounded-borders">
            {{ error }}
          </q-banner>

          <q-banner
            v-if="mensaje"
            class="bg-green-1 text-positive rounded-borders"
          >
            {{ mensaje }}
          </q-banner>

          <q-btn
            type="submit"
            label="Ingresar al sistema"
            class="submit-btn full-width"
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
              label="Volver a Glow Studio"
              @click="volverInicio"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'
const router = useRouter()

const formulario = ref({
  usuario: '',
  password: '',
})

const mostrarPassword = ref(false)
const procesando = ref(false)
const error = ref('')
const mensaje = ref('')


async function iniciarSesion() {
  error.value = ''
  mensaje.value = ''
  procesando.value = true

  try {
    const respuesta = await axios.post(`${API_URL}/auth/admin-login`, {
      usuario: formulario.value.usuario,
      password: formulario.value.password,
    })

    const resultado = respuesta.data
    const usuario = resultado.user
    const token = resultado.token || resultado.accessToken

    if (!token || !usuario || usuario.role !== 'admin') {
      throw new Error('No se pudo verificar una sesión administrativa.')
    }

    localStorage.setItem('glow_token', token)
    localStorage.setItem('glow_user', JSON.stringify(usuario))

    formulario.value.password = ''
    await router.replace('/admin')
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      'No fue posible iniciar sesión.'
  } finally {
    procesando.value = false
  }
}

function volverInicio() {
  router.push('/')
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 28px 16px;
  background: linear-gradient(135deg, #fffaf7, #f3e4e1);
  font-family: Arial, Helvetica, sans-serif;
}

.admin-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  border: 1px solid #ead5d2;
  border-radius: 18px;
  background: #fffdfb;
  box-shadow: 0 22px 65px #56363a12;
}

.admin-decoration {
  height: 7px;
  background: linear-gradient(90deg, #d8a0a5, #a85f6d, #e7c3bd);
}

.admin-symbol {
  color: #b76e79;
  font-size: 42px;
}

.brand-title {
  margin-top: 8px;
  color: #382b30;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 28px;
}

.brand-title strong {
  color: #b76e79;
  font-weight: 400;
}

.admin-label {
  margin-top: 25px;
  color: #b76e79;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 3px;
}

h1 {
  margin: 14px 0 10px;
  color: #382b30;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 29px;
  font-weight: 400;
}

.subtitle {
  color: #81747a;
  font-size: 13px;
  line-height: 1.7;
}

.submit-btn {
  min-height: 46px;
  margin-top: 10px;
  border-radius: 6px;
  background: #b76e79;
  color: white;
}

.submit-btn:hover {
  background: #9f5965;
}
</style>