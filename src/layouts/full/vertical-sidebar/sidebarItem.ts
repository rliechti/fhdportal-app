import {
    HomeIcon,
    UploadIcon,
    FoldersIcon,
    FilesIcon,
    ApiIcon,
    BracesIcon,
    Book2Icon,
    ScaleIcon,
    InfoCircleIcon,
    UsersIcon,
    CodeIcon,
    AtIcon,
		TerminalIcon
} from 'vue-tabler-icons';

export interface menu {
    header?: string;
    title?: string;
    icon?: any;
    to?: string;
    chip?: string;
    chipBgColor?: string;
    chipColor?: string;
    chipVariant?: string;
    chipIcon?: string;
    children?: menu[];
    disabled?: boolean;
    hidden?: boolean;
    type?: string;
    subCaption?: string;
}

const sidebarItem: menu[] = [
    { header: 'FEGA Switzerland' },
    {
        title: 'Home',
        icon: HomeIcon,
        to: '/',
        protected: false
    },
    {
        title: 'Submitter portal',
        icon: UploadIcon,
        to: '/submissions',
        protected: true
    },

    { header: 'Catalogue' },
    {
        title: 'Studies/Cohorts',
        icon: FoldersIcon,
        to: '/studies',
        protected: true
    },
    {
        title: 'Datasets',
        icon: FilesIcon,
        to: '/datasets',
        protected: true
    },
    { header: 'Documentation' },
    {
        title: 'OpenAPI',
        icon: ApiIcon,
        to: `${import.meta.env.VITE_API_URL}doc`,
        type: 'external',
        protected: false
    },
    {
        title: 'Metadata',
        icon: BracesIcon,
        to: '/metadata',
        protected: false
    },
    {
        title: 'CLI',
        icon: TerminalIcon,
        to: '/cli',
        protected: false
    },
    {
        title: 'Privacy policy',
        icon: Book2Icon,
        to: '/privacy',
        protected: false
    },
    {
        title: 'Terms of use',
        icon: ScaleIcon,
        to: '/terms_of_use',
        protected: false
    },
    { header: 'About' },
    {
        title: 'FEGA',
        icon: InfoCircleIcon,
        to: 'https://ega-archive.org/about/projects-and-funders/federated-ega/',
				type: 'external',
        protected: false
    },
    {
        title: 'Teams',
        icon: UsersIcon,
        to: '/teams',
        protected: false
    },
    {
        title: 'Codebase',
        icon: CodeIcon,
        to: '/codebase',
        protected: false
    },
    {
        title: 'Contact us',
        icon: AtIcon,
        to: '/contacts',
        protected: false
    },
    { header: 'Admin',admin: true },
    {
        title: 'Users',
        icon: UsersIcon,
        to: '/admin/users',
        protected: true,
        admin: true
    }
];

export default sidebarItem;
