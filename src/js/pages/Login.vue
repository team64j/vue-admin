<script>
import store from '../store'
import router from '../router'

export default {
  name: 'Login',
  data () {
    return {
      form: {
        hostname: store.getters['Storage/get']('hostname') || location.origin
      },
      data: null,
      connected: false,
      lang: null,
      errors: {},
      isCheckServer: false,
      isLogin: false,
      isShowLanguages: false
    }
  },
  created () {
    this.checkServer()
  },
  methods: {
    checkServer () {
      this.data = null
      this.connected = false
      this.errors = {}
      this.isCheckServer = true

      if (!this.form['hostname']) {
        this.form['hostname'] = location.origin
      }

      store.dispatch('Storage/set', { hostname: this.form['hostname'].replace(/\/$/g, '') })

      axios.post('bootstrap').then(r => {
        if (typeof r.data === 'string') {
          this.errors['hostname'] = true
          return
        }

        this.data = r.data

        if (this.data.version) {
          this.connected = true
        }

        if (this.data.languages) {
          this.lang = this.data.languages[store.getters['Storage/get']('lang') || 'en'] ?? {}
        }
      }).catch(() => {
        this.connected = false
        this.errors['hostname'] = true
      }).finally(() => {
        this.isCheckServer = false
      })
    },
    showLanguage () {
      this.isShowLanguages = !this.isShowLanguages
    },
    selectLanguage (lang) {
      this.lang = lang
      store.dispatch('Storage/set', { lang: lang.key })
      this.showLanguage()
    },
    login () {
      this.errors = {}
      this.isLogin = true

      axios.post('/auth/login', this.form).then(r => {
        if (r.data['access_token']) {
          store.dispatch('Storage/set', { lang: this.lang.key })

          store.dispatch('Storage/set', {
            token: r.data['access_token'],
            tokenExpiresIn: r.data['expires_in']
          }).then(() => {
            router.push('/').then(() => location.reload())
          })
        }
      }).catch(() => {
        this.errors['username'] = true
        this.errors['password'] = true
      }).finally(() => {
        this.isLogin = false
      })
    }
  }
}
</script>

<template>
  <div class="dark flex w-full h-full justify-center items-center bg-login">
    <div class="relative overflow-hidden bg-gray-950 text-white/80 rounded-2xl p-6 shadow-lg w-[30rem] max-w-[95%]">

      <div>
        <label for="hostname" class="font-medium">Manager API</label>

        <div class="flex mb-2">
          <div v-if="lang" class="grow-0 flex -mr-[1px]">
            <button type="button" class="h-full flex items-center rounded-r-none font-medium" @click="showLanguage">
              {{ lang.key.toUpperCase() }}
            </button>
          </div>
          <div class="grow flex">
            <input v-model="form['hostname']" type="text" id="hostname" class="rounded-r-none z-[1]"
                   :class="[ errors['hostname'] ? '!border-rose-500 !ring-rose-500' : '', lang ? 'rounded-l-none' : '']">
          </div>
          <div class="grow-0 flex -ml-[1px]">
            <button type="button" class="h-full flex items-center rounded-l-none"
                    :class="[ connected ? 'btn-blue' : '']"
                    :disabled="isCheckServer"
                    @click="checkServer">
              <i v-if="isCheckServer" class="fa fa-circle-notch fa-fw animate-spin"/>
              <i v-else class="fa fa-globe fa-fw"/>
            </button>
          </div>
        </div>
      </div>

      <div v-if="connected" class="pt-2">
        <div class="mb-4">
          <label for="username" class="font-medium">{{ lang.user }}</label>
          <input v-model="form['username']"
                 type="text"
                 id="username"
                 name="username"
                 :class="[ errors['username'] ? '!border-rose-500 !ring-rose-500' : '']"
                 autocomplete="username">
        </div>

        <div class="mb-4">
          <label for="password" class="font-medium">{{ lang.password }}</label>
          <input v-model="form['password']" type="password"
                 id="password"
                 name="password"
                 :class="[ errors['password'] ? '!border-rose-500 !ring-rose-500' : '']">
        </div>

        <div class="mb-2 flex justify-between items-center">
          <div class="inline-flex items-center">
            <input type="checkbox" id="remember" name="remember" checked value="1" class="mr-2">
            <label for="remember">{{ lang.remember }}</label>
          </div>
          <div>
            <button type="button" class="btn-green flex items-center justify-center" :disabled="isLogin" @click="login">
              <i v-if="isLogin" class="fa fa-circle-notch fa-fw animate-spin absolute"/>
              <span :class="[ isLogin ? 'opacity-0' : '' ]">{{ lang.login }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="data?.version" class="text-xs text-gray-400 text-center mt-4 -mb-4">
        {{ data.version }}
      </div>

      <div v-if="isShowLanguages && data?.languages"
           class="absolute z-10 bg-gray-950 text-white/80 rounded-2xl p-6 left-0 top-0 w-full h-full overflow-auto">
        <i class="fa fa-close text-rose-600 absolute top-3 right-3 cursor-pointer" @click="showLanguage"/>

        <div v-for="i in data.languages"
             class="px-4 py-1 hover:bg-blue-600 hover:text-white rounded cursor-pointer transition"
             :class="[lang.key === i.key ? 'bg-white/10' : '']"
             @click="selectLanguage(i)">
          <i class="fa fa-fw" :class="[lang.key === i.key ? 'fa-check' : '']"/>
          {{ i.value }}
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.bg-login {
  @apply bg-center bg-cover;
  background-image: url("../../img/login-background.jpg");
}
</style>

<style>
html {
  font-size: 16px;
}
</style>
