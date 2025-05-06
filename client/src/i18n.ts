import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
const resources = {
  en: {
    translation: {
      header: {
        title: 'Student Portal',
      },
      sidebar: {
        portalName: 'Bishop Academy',
        logout: 'Logout',
      },
      dashboard: {
        title: 'My Applications',
        startApplication: 'Start New Application',
        noApplications: 'No applications yet',
        startNow: 'Get started by creating a new application.',
        approved: 'Approved',
        rejected: 'Rejected',
        waitlisted: 'Waitlisted',
        under_review: 'Under Review',
        draft: 'Draft',
        continueApplication: 'Continue',
      },
      application: {
        applicationNumber: 'Application ID',
        program: 'Program',
        submissionDate: 'Submitted',
      },
      common: {
        status: 'Status',
        actions: 'Actions',
        view: 'View',
      },
      settings: {
        title: 'Settings',
      },
      applications: {
        title: 'Applications',
      },
    },
  },
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    fallbackLng: 'en',
  });

export default i18n;
