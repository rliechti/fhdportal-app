<template>
  <span
    v-if="study.creator_username == $store.user.id"
    class="Permissions"
  >
    <v-dialog v-model="dialog" width="auto">
      <v-card width="800px" title="Permissions">
        <v-list v-if="!add" lines="one">
          <v-list-item
            v-for="(user, idx) in study.access"
            :key="idx"
            :title="user.username"
          >
            <v-list-item-subtitle>{{ user.permissions }}</v-list-item-subtitle>
            <template #append>
              <p v-if="edit == user.user_id">
                <v-radio-group v-model="new_role" class="ml-2" inline>
                  <v-radio
                    v-for="role in roles"
                    :key="role.id"
                    :label="role.name"
                    :value="role"
                  ></v-radio>
                </v-radio-group>
              </p>
              <template v-if="!edit">
                <v-btn
                  color="grey-lighten-1"
                  icon="mdi-close"
                  variant="text"
                  @click="deleteUser(user.user_id)"
                ></v-btn>
                <v-btn
                  color="grey-lighten-1"
                  icon="mdi-pencil"
                  variant="text"
                  @click="editUser('init', user)"
                ></v-btn>
              </template>
              <v-btn
                v-else-if="edit == user.user_id"
                color="grey-lighten-1"
                icon="mdi-check"
                variant="text"
                @click="editUser('save', user)"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-text-field
          v-if="add"
          v-model="newUser.email"
          append-icon="mdi-send"
          clear-icon="mdi-close-circle"
          label="Enter email adress"
          type="email"
          variant="filled"
          clearable
          @click:append="searchUser"
          @click:clear="email = null"
        ></v-text-field>
        <p v-if="newUser.status == 'validated'">
          <v-radio-group v-model="newUser.role" class="ml-2" inline>
            <v-radio
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role"
            ></v-radio>
          </v-radio-group>
          <v-btn
            v-if="
              newUser.email && newUser.role && newUser.status == 'validated'
            "
            class="ml-4"
            color="primary"
            :text="'Add ' + newUser.email + ' with role ' + newUser.role.name"
            @click="addStudyUser()"
          ></v-btn>
        </p>

        <template #actions>
          <v-btn
            v-if="!add"
            color="primary"
            text="Add user"
            @click="addUser()"
          ></v-btn>
          <v-btn class="ms-auto" text="Cancel" @click="close()"></v-btn>
        </template>
      </v-card>
    </v-dialog>

    <v-btn
      v-if="display == 'share'"
      size="small"
      color="warning"
      variant="outlined"
      @click="init()"
      ><v-icon class="mr-1" icon="mdi-share"></v-icon> Share
    </v-btn>
    <v-btn v-else class="float-right" @click="init()">Manage permissions</v-btn>
  </span>
</template>

<script>
import { defineComponent } from 'vue'
import { useSubmissionStore } from '@/stores/submissions.js'
export default defineComponent({
  name: 'Permissions',
  components: {
  },
  props: ['study', 'studyModifiers','display'],
  emits: ['update:study'],
  data() {
    return {
      dialog: false,
      new_role: false,
      add: false,
      edit: false,
      newUser: { email: null, status: null },
      error: '',
      roles: [],
    }
  },
  mounted() {
    this.submissionStore = useSubmissionStore()
    this.submissionStore.getRoles().then((roles) => {
      this.roles = roles
    })
    this.submissionStore.getStatusTypes()
  },
  methods: {
    editUser(action, user) {
      if (action == 'init') {
        this.edit = user.user_id
        this.new_role = { id: user.role_id, name: user.role }
      } else if (action == 'save') {
        this.newUser = user
        this.newUser.id = user.user_id
        this.newUser.role_id = this.new_role.id
        this.newUser.study_id = this.study.id
        this.addStudyUser('edit')
      }
    },
    deleteUser(user_id) {
      this.submissionStore
        .deleteStudyUser({ user_id: user_id, study_id: this.study.id })
        .then((res) => {
          const study = JSON.parse(JSON.stringify(this.study))
          study.access = res
          this.$emit('update:study', study)
          this.$notify({ title: 'User deleted successfully', type: 'success' })
        })
        .catch((err) =>
          this.$notify({
            title: err.response.statusText,
            text: err.response.data,
            type: 'error',
          }),
        )
    },
    close() {
      this.newUser = { email: null, status: null }
      this.add = false
      this.dialog = false
    },
    addStudyUser(action) {
      this.submissionStore
        .addStudyUser(this.newUser)
        .then((res) => {
          const study = JSON.parse(JSON.stringify(this.study))
          study.access = res
          this.$emit('update:study', study)
          this.newUser = { email: null, status: null }
          this.add = false
          this.new_role = null
          this.edit = false
          let message =
            action == 'edit'
              ? 'User edited successfully'
              : 'User added successfully'
          this.$notify({ title: message, type: 'success' })
        })
        .catch((err) =>
          this.$notify({
            title: err.response.statusText,
            text: err.response.data,
            type: 'error',
          }),
        )
    },
    searchUser() {
      this.submissionStore
        .getUsers({ email: this.newUser.email })
        .then((user) => {
          if (user) {
            this.newUser = user
            this.newUser.study_id = this.study.id
            this.newUser.status = 'validated'
          } else {
            this.$notify({
              title: 'Not found',
              text: "User '" + this.newUser.email + "' doesn't exist",
              type: 'warning',
            })
          }
        })
        .catch((err) =>
          this.$notify({
            title: err.response.statusText,
            text: err.response.data,
            type: 'error',
          }),
        )
    },
    init() {
      this.dialog = true
    },
    addUser() {
      this.add = !this.add
    },
  },
})
</script>