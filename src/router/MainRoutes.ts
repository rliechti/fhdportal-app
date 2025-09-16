// Components
import Home from '@/views/Home.vue'
import Submission from '@/views/Submission.vue'
import Studies from '@/views/Studies.vue'
import Study from '@/views/Study.vue'
import SubmissionStudy from '@/views/SubmissionStudy.vue'
import PublicDatasets from '@/views/PublicDatasets.vue'
import PublicDataset from '@/views/PublicDataset.vue'
import MetadataView from '@/views/Metadata.vue'
import CliView from '@/views/Cli.vue'
import Privacy from '@/views/Privacy.vue'
import TermsOfUse from '@/views/TermsOfUse.vue'
import Teams from '@/views/Teams.vue'
import Codebase from '@/views/Codebase.vue'
import Contacts from '@/views/Contacts.vue'
import Users from '@/views/admin/Users.vue'

const MainRoutes = {
    path: '/main',
    meta: {
        allowAnonymous: true
    },
    redirect: '/main',
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
          allowAnonymous: true,
        },
      },
      {
        path: '/submissions',
        name: 'Submission',
        component: Submission,
        meta: {
          allowAnonymous: false,
        },
      },
      {
        path: '/submissions/:study_id',
        name: 'SubmissionStudy',
        component: SubmissionStudy,
        meta: {
          allowAnonymous: false,
        },
      },
      {
        path: '/studies',
        name: 'Studies',
        component: Studies,
        meta: {
          allowAnonymous: false,
        },
      },
      {
        path: '/studies/:study_id',
        name: 'Study',
        component: Study,
        meta: {
          allowAnonymous: false,
        },
      },
      {
        path: '/datasets',
        name: 'PublicDatasets',
        component: PublicDatasets,
        meta: {
          allowAnonymous: false,
        },
      },
      {
        path: '/datasets/:dataset_id',
        name: 'PublicDataset',
        component: PublicDataset,
        meta: {
          allowAnonymous: false,
        },
      },
      {
        path: '/metadata',
        name: 'MetadataView',
        component: MetadataView,
        meta: {
          allowAnonymous: true,
        },
      },
      {
        path: '/cli',
        name: 'CliView',
        component: CliView,
        meta: {
          allowAnonymous: true,
        },
      },
      {
        path: '/privacy',
        name: 'Privacy',
        component: Privacy,
        meta: {
          allowAnonymous: true,
        },
      },
      {
        path: '/terms_of_use',
        name: 'TermsOfUse',
        component: TermsOfUse,
        meta: {
          allowAnonymous: true,
        },
      },
      {
        path: '/teams',
        name: 'Teams',
        component: Teams,
        meta: {
          allowAnonymous: true,
        },
      },
      {
        path: '/codebase',
        name: 'Codebase',
        component: Codebase,
        meta: {
          allowAnonymous: true,
        },
      },
      {
        path: '/contacts',
        name: 'Contacts',
        component: Contacts,
        meta: {
          allowAnonymous: true,
        },
      },
      {
        path: '/admin/users',
        name: 'Users',
        component: Users,
        meta: {
          allowAnonymous: false,
        },
      },
    ]
};

export default MainRoutes;
