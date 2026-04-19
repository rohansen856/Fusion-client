import { host } from "../globalRoutes";

const base = `${host}/placement/api`;

// Existing routes (kept for backward compatibility)
export const addPlacementEventForm = `${base}/placement/`;
export const fetchApplicationsRoute = `${base}/student-applications/`;
export const handleStatusChangeRoute = `${base}/student-applications/`;
export const downloadExcelRoute = `${base}/download-applications/`;
export const submitNextRoundDetailsRoute = `${base}/nextround/`;
export const downloadCVRoute = `${base}/generate-cv/`;
export const calendarEventsRoute = `${base}/calender/`;
export const fetchPlacementStatsRoute = `${base}/statistics/`;
export const deletePlacementStatsRoute = `${base}/delete-statistics/`;
export const fetchPlacementScheduleRoute = `${base}/schedules/`;
export const seedDemoPlacementSchedulesRoute = `${base}/schedules/demo-seed/`;
export const fetchTimeLineRoute = `${base}/timeline/`;
export const fetchDebaredlistRoute = `${base}/debared-students/`;
export const debarredStatusRoute = `${base}/debared-status/`;
export const fetchFieldsSubmitformRoute = `${base}/add-field/`;
export const fetchRestrictionsRoute = `${base}/restrictions/`;
export const fetchRegistrationRoute = `${base}/registration/`;
export const ApplyForPlacementRoute = `${base}/apply-for-placement/`;
export const fetchFormFieldsRoute = `${base}/form-fields/`;
export const sendNotificationRoute = `${host}/notifications/api/placement_cell_notification/`;

// Dashboard & general
export const dashboardRoute = `${base}/dashboard/`;
export const recordsRoute = `${base}/records/`;
export const statisticsRoute = `${base}/statistics/`;
export const visitsRoute = `${base}/visits/`;

// Student endpoints
export const studentProfileRoute = `${base}/profile/`;
export const studentProfileDocumentsRoute = `${base}/profile/documents/`;
export const jobsRoute = `${base}/jobs/`;
export const approvedJobsRoute = `${base}/jobs/approved/`;
export const jobDetailRoute = (id) => `${base}/jobs/${id}/`;
export const applicationsRoute = `${base}/applications/`;
export const withdrawApplicationRoute = (id) => `${base}/applications/${id}/withdraw/`;
export const applicationStatusRoute = `${base}/applications/status-dashboard/`;
export const offersRoute = `${base}/offers/`;
export const respondOfferRoute = (id) => `${base}/offers/${id}/respond/`;
export const seedDemoOffersRoute = `${base}/offers/demo-seed/`;
export const appealsRoute = `${base}/appeals/`;
export const withdrawAppealRoute = (id) => `${base}/appeals/${id}/withdraw/`;
export const generateCvRoute = `${base}/generate-cv/`;
export const timelineRoute = (jobId) => `${base}/timeline/${jobId}/`;
export const notificationPreferencesRoute = `${base}/notification-preferences/`;

// TPO endpoints
export const companiesRoute = `${base}/companies/`;
export const companyReviewRoute = (id) => `${base}/companies/${id}/review/`;
export const jobPostingReviewListRoute = `${base}/job-postings/review/`;
export const jobPostingReviewRoute = (id) => `${base}/job-postings/${id}/review/`;
export const interviewsRoute = `${base}/interviews/`;
export const interviewRescheduleRoute = (id) => `${base}/interviews/${id}/reschedule/`;
export const allApplicationsRoute = `${base}/all-applications/`;
export const applicationOverrideRoute = (id) => `${base}/applications/${id}/override/`;
export const placementConfigRoute = `${base}/config/`;
export const allAppealsRoute = `${base}/appeals/manage/`;
export const resolveAppealRoute = (id) => `${base}/appeals/${id}/resolve/`;
export const reviewAppealRoute = (id) => `${base}/appeals/${id}/review/`;
export const sendNotifRoute = `${base}/notifications/send/`;
export const debarredStudentsRoute = `${base}/debarred-students/`;
export const placementSchedulesRoute = `${base}/placement-schedules/`;
export const generateReportRoute = `${base}/reports/`;

// Chairman endpoints
export const chairmanDashboardRoute = `${base}/chairman/dashboard/`;
export const policiesRoute = `${base}/policies/`;
export const policyApproveRoute = (id) => `${base}/policies/${id}/approve/`;
export const chairmanAnnouncementRoute = `${base}/chairman/announcements/`;

// Company/Recruiter endpoints
export const companyRegisterRoute = `${base}/registration/`;
export const myJobsRoute = `${base}/my-jobs/`;
export const myJobDetailRoute = (id) => `${base}/my-jobs/${id}/`;
export const myJobApplicationsRoute = (id) => `${base}/my-jobs/${id}/applications/`;
export const shortlistCandidatesRoute = (id) => `${base}/my-jobs/${id}/shortlist/`;
export const myJobInterviewsRoute = (id) => `${base}/my-jobs/${id}/interviews/`;
export const submitFeedbackRoute = (id) => `${base}/my-jobs/${id}/feedback/`;
export const extendOffersRoute = (id) => `${base}/my-jobs/${id}/offers/`;

// Alumni endpoints
export const alumniRegisterRoute = `${base}/alumni/register/`;
export const alumniProfileRoute = `${base}/alumni/profile/`;
export const mentorshipRoute = `${base}/alumni/mentorship/`;
export const referralsRoute = `${base}/alumni/referrals/`;

// System endpoints
export const eligibilityCheckRoute = `${base}/eligibility/`;
export const auditLogsRoute = `${base}/audit-logs/`;
export const analyticsRoute = `${base}/analytics/`;
