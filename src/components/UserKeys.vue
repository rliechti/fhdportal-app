<template>
  <div class="container jf-form" >
    <div class="mx-4 my-0">
      <v-card :variant="type.toUpperCase()==='SSH'?'elevated':'outlined'" max-height="none">
        <v-card-title class="group-label">
          {{ maxNbKeys === 1 ? 'R' : 'List of r' }}egistered
          {{ type.toUpperCase() }} public key{{ maxNbKeys === 1 ? '' : 's' }}
          <span
            v-if="
              userKeys !== undefined && userKeys.length > 0 && maxNbKeys > 1
            "
            >({{ userKeys.length }})</span
          >:
          <v-btn
            class="float-right"
            variant="flat"
            @click="showKeys = !showKeys"
            ><v-icon :icon="`mdi-chevron-${showKeys ? 'up' : 'down'}`"
          /></v-btn>
        </v-card-title>
        <v-card-text v-if="userKeys.length<1"  class="github-markdown-body">
          <template v-if="type.toUpperCase()==='SSH'">
            <SshKeyContent 
            :sda_inbox_url="sda_inbox_url"
            :sda_inbox_ip="sda_inbox_ip"
            :sda_sftp_port="sda_sftp_port"            
            :email="user.email"
            />
          </template>
          <template v-if="type.toUpperCase()==='C4GH'">
            <C4ghKeyContent />
          </template>

        </v-card-text>
        <v-card-text>        
          <v-list density="compact">
            <template v-if="showKeys">
              <v-list-item
                v-for="userKey in userKeys"
                :key="userKey"
                class="v-code p-0 m-0"
              >
                <v-row no-gutters>
                  <template v-if="type === 'ssh'">
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
                  <template v-if="type === 'c4gh'">
                    <v-col cols="9">
                      <code>{{
                        userKey
                          .replace('-----BEGIN CRYPT4GH PUBLIC KEY-----', '')
                          .replace('-----END CRYPT4GH PUBLIC KEY-----', '')
                      }}</code>
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
              v-if="(showKeys || userKeys === undefined || userKeys.length == 0) && userKeys.length < maxNbKeys"
            >
              <v-form v-model="formValid" v-if="userKeys.length < maxNbKeys">
                <v-container>
                  <v-row>
                    <v-col cols="9">
                      <template v-if="`${type.toUpperCase() == 'C4GH'}`">
                        <v-textarea
                          v-model="newKey"
                          :label="`${type.toUpperCase()} public key ${type === 'ssh' ? '(RSA or ed25519)' : ''}`"
                          density="compact"
                          rows="4"
                          required
                        ></v-textarea>
                      </template>
                      <template v-else>
                        <v-text-field
                          v-model="newKey"
                          :label="`${type.toUpperCase()} public key ${type === 'ssh' ? '(RSA or ed25519)' : ''}`"
                          density="compact"
                          required
                        ></v-text-field>
                      </template>
                    </v-col>
                    <v-col cols="3">
                      <v-btn
                       color="success"
                        size="large"
                        :disabled="!isKeyValid"
                        padding="3px"
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
import C4ghKeyContent from '@/assets/documentation/C4ghKey.md'
import SshKeyContent from '@/assets/documentation/SshKey.md'
import '@/assets/styles/github.css'
import { notifyError } from '@/utils/notify'
export default {
  name: 'UserKeys',
  props: ['type', 'show'],
  components: {
    C4ghKeyContent,
    SshKeyContent
  },
  computed: {
    ...mapState(useAuthStore, ['user']),
    isKeyValid() {
      if (!this.newKey) return false
      if (this.type === 'ssh') {
        if (
          this.newKey &&
          this.newKey.match(/ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ([^@]+@[^@]+)/)
        ) {
          return true
        }
        let parts = this.newKey.split(' ')
        if (parts[0] == 'ssh-ed25519') return true
      } else if (this.type === 'c4gh') {
        if (this.newKey.length > 10) return true
      }
      return false
    },
    userKeys() {
      let keys = []
      if (this.user[this.type + 'PublicKeys'] !== undefined) {
        return this.user[this.type + 'PublicKeys']
      }
      return keys
    },
    maxNbKeys() {
      return this.type === 'ssh' ? 10 : 1
    }
  },
  data() {
    return {
      formValid: false,
      activeKey: null,
      showKeys: false,
      newKey: '',
      sda_inbox_url: import.meta.env.VITE_SDA_INBOX_URL,
      sda_inbox_ip: import.meta.env.VITE_SDA_INBOX_IP,
      sda_c4gh_key: import.meta.env.VITE_SDA_C4GH_KEY,
      sda_sftp_port: import.meta.env.VITE_SDA_SFTP_PORT
      
    }
  },
  methods: {
    registerNewKey() {
      const store = useAuthStore()
      store
        .registerKey({ type: this.type, userKey: this.newKey })
        .then(() => {
          this.newKey = null
          this.$notify({
            title: 'Success',
            text: 'Key registered successfully',
            type: 'success',
          })
        })
        .catch(() =>
          notifyError('Failed to register key. Please try again.'),
        )
    },
    deleteKey(userKey) {
      if (this.activeKey !== userKey) {
        this.activeKey = userKey
      } else {
        const store = useAuthStore()

        store
          .deleteKey({ userKey: userKey, type: this.type })
          .then(() => {
            this.activeKey = null
            this.$notify({
              title: 'Success',
              text: 'Key deleted successfully',
              type: 'success',
            })
          })
          .catch(() =>
            notifyError('Failed to delete key. Please try again.'),
          )
      }
    },
  },
  mounted() {
    this.showKeys = this.show
  },
}
</script>
