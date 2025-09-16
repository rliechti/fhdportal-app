<template>
  <div class="container">
    <div class="mx-5 my-5">
      <v-card variant="elevated">
        <v-card-text>
          <h3 class="mb-3">
            {{maxNbKeys===1?'R':'List of r'}}egistered {{type.toUpperCase()}} public key{{maxNbKeys===1?'':'s'}} 
            <span
              v-if="
                userKeys !== undefined &&
                userKeys.length > 0 &&
                maxNbKeys > 1
              "
              >({{ userKeys.length }})</span
            >:
            <v-btn
              class="float-right"
              variant="flat"
              @click="showKeys = !showKeys"
              ><v-icon :icon="`mdi-chevron-${showKeys ? 'up' : 'down'}`"
            /></v-btn>
          </h3>
          <v-list density="compact">
            <template v-if="showKeys">
              <v-list-item
                v-for="userKey in userKeys"
                :key="userKey"
                class="v-code p-0 m-0"
              >
                <v-row no-gutters>
                  <template  v-if="type==='ssh'">
                    <v-col cols="2">
                      <code>{{ userKey.split(' ')[0] }}</code>
                    </v-col>
                    <v-col cols="4">
                      <code
                        >{{ userKey.split(' ')[1].substring(0, 15) }}[...]{{
                          userKey
                            .split(' ')[1]
                            .substring(
                              userKey.split(' ')[1].length - 15,
                              userKey.split(' ')[1].length,
                            )
                        }}</code
                      >
                    </v-col>
                    <v-col cols="3">
                      <code>{{ userKey.split(' ')[2] }}</code>
                    </v-col>                  
                  </template>
                  <template v-if="type==='c4gh'">
                    <v-col cols="9">
                      <code>{{userKey.replace("-----BEGIN CRYPT4GH PUBLIC KEY-----","").replace("-----END CRYPT4GH PUBLIC KEY-----","")}}</code>
                    </v-col>
                  </template>
                  <v-col cols="3">
                    <v-btn
                      size="small"
                      variant="outlined"
                      color="error"
                      @click="deleteKey(userKey)"
                      ><v-icon icon="mdi-delete" />{{
                        activeKey === userKey ? 'confirm' : 'delete...'
                      }}</v-btn
                    >
                    <v-btn
                      v-if="activeKey === userKey"
                      variant="outlined"
                      size="small"
                      color="secondary"
                      class="mx-2"
                      @click="activeKey = null"
                      >cancel</v-btn
                    >
                  </v-col>
                </v-row>
              </v-list-item>
            </template>
            <v-list-item
              v-if="
                showKeys ||
                userKeys === undefined ||
                userKeys.length == 0
              "
            >
              <v-form v-model="formValid" v-if="userKeys.length < maxNbKeys">
                <v-container>
                  <v-row>
                    <v-col cols="10">
                      <v-text-field
                        v-model="newKey"
                        :label="`${type.toUpperCase()} public key ${type==='ssh'?'(RSA or ed25519)':''}`"
                        density="compact"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="2">
                      <v-btn
                        size="small"
                        :disabled="!isKeyValid"
                        @click="registerNewKey"
                        >register new key</v-btn
                      >
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useAuthStore } from '@/stores/auth.ts'
export default {
  name: 'UserKeys',
  props: ['type','show'],
  computed: {
    ...mapState(useAuthStore, ['user']),
    isKeyValid() {
      if (!this.newKey) return false
      if (this.type === 'ssh'){
        if (
          this.newKey &&
          this.newKey.match(/ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ([^@]+@[^@]+)/)
        ) {
          return true
        }
        let parts = this.newKey.split(' ')
        if (parts[0] == 'ssh-ed25519') return true          
      }
      else if (this.type === 'c4gh'){
        if (this.newKey.length > 10) return true
      }
      return false
    },
    userKeys () {
      let keys = []
      if (this.user[this.type+"PublicKeys"] !== undefined){
        return this.user[this.type+"PublicKeys"];
      }
      return keys
    },
    maxNbKeys(){
      return this.type === "ssh" ? 10 : 1
    }
  },
  data() {
    return {
      formValid: false,
      activeKey: null,
      showKeys: false,
      newKey: '',
    }
  },
  methods: {
    registerNewKey() {
      const store = useAuthStore()
      store.registerKey({type: this.type, userKey: this.newKey}).then(() => {
        this.newKey = null
        this.$notify({title: "Success",text:"Key registered successfully",type:"success"})
      }).catch(err => this.$notify({title: "Error",text: err,type:"danger"}))
    },
    deleteKey(userKey) {
      if (this.activeKey !== userKey) {
        this.activeKey = userKey
      } else {
        const store = useAuthStore()
        
        store.deleteKey({userKey: userKey, type: this.type}).then(() => {
          this.activeKey = null
          this.$notify({title: "Success",text:"Key deleted successfully",type:"success"})
        }).catch(err => this.$notify({title: "Error",text: err,type:"danger"}))
      }
    },
  },
  mounted () {
    this.showKeys = this.show
  }
}
</script>
