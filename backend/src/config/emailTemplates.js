const EMAIL_TEMPLATES = {
  mentorship_request: {
    id: 'mentorship_request',
    displayName: 'Mentorship Request',
    description: 'Reach out to a mentor for guidance',
    requiredFields: [
      { key: 'name',                 label: 'Your Name',               type: 'text'     },
      { key: 'mentorName',           label: 'Mentor Name',             type: 'text'     },
      { key: 'currentRole',          label: 'Current Role',            type: 'text'     },
      { key: 'skills',               label: 'Skills',                  type: 'textarea' },
      { key: 'goals',                label: 'Career Goals',            type: 'textarea' },
      { key: 'reasonForReachingOut', label: 'Reason For Reaching Out', type: 'textarea' },
    ],
    optionalFields: [
      { key: 'github', label: 'GitHub', type: 'text' },
    ],
  },

  internship_application: {
    id: 'internship_application',
    displayName: 'Internship Application',
    description: 'Apply for an internship position',
    requiredFields: [
      { key: 'name',       label: 'Your Name',      type: 'text'     },
      { key: 'position',   label: 'Position',       type: 'text'     },
      { key: 'skills',     label: 'Skills',         type: 'textarea' },
      { key: 'experience', label: 'Experience',     type: 'textarea' },
    ],
    optionalFields: [
      { key: 'portfolio', label: 'Portfolio', type: 'text' },
      { key: 'github',    label: 'GitHub',    type: 'text' },
    ],
  },

  networking_email: {
    id: 'networking_email',
    displayName: 'Networking Email',
    description: 'Connect with someone in your industry',
    requiredFields: [
      { key: 'name',              label: 'Your Name',          type: 'text'     },
      { key: 'currentRole',       label: 'Current Role',       type: 'text'     },
      { key: 'reasonForConnecting', label: 'Reason for Connecting', type: 'textarea' },
      { key: 'sharedInterest',    label: 'Shared Interest',    type: 'textarea' },
    ],
    optionalFields: [
      { key: 'linkedin', label: 'LinkedIn', type: 'text' },
    ],
  },

  hr_followup: {
    id: 'hr_followup',
    displayName: 'HR Follow-up',
    description: 'Follow up after an interview or application',
    requiredFields: [
      { key: 'name',          label: 'Your Name',        type: 'text'     },
      { key: 'position',      label: 'Position Applied', type: 'text'     },
      { key: 'interviewDate', label: 'Interview Date',   type: 'text'     },
      { key: 'keyPoints',     label: 'Key Points to Highlight', type: 'textarea' },
    ],
    optionalFields: [
      { key: 'referral', label: 'Referral Name', type: 'text' },
    ],
  },

  project_collaboration: {
    id: 'project_collaboration',
    displayName: 'Project Collaboration',
    description: 'Propose collaboration on a project',
    requiredFields: [
      { key: 'name',            label: 'Your Name',        type: 'text'     },
      { key: 'projectName',     label: 'Project Name',     type: 'text'     },
      { key: 'projectDetails',  label: 'Project Details',  type: 'textarea' },
      { key: 'yourContribution',label: 'Your Contribution',type: 'textarea' },
    ],
    optionalFields: [
      { key: 'github',    label: 'GitHub Repo', type: 'text' },
      { key: 'portfolio', label: 'Portfolio',   type: 'text' },
    ],
  },

  meeting_request: {
    id: 'meeting_request',
    displayName: 'Meeting Request',
    description: 'Request a meeting or call',
    requiredFields: [
      { key: 'name',        label: 'Your Name',       type: 'text'     },
      { key: 'purpose',     label: 'Meeting Purpose', type: 'textarea' },
      { key: 'availability',label: 'Your Availability', type: 'textarea' },
    ],
    optionalFields: [
      { key: 'duration', label: 'Preferred Duration', type: 'text' },
    ],
  },

  thank_you_email: {
    id: 'thank_you_email',
    displayName: 'Thank You Email',
    description: 'Send a thank you after a meeting or interview',
    requiredFields: [
      { key: 'name',          label: 'Your Name',           type: 'text'     },
      { key: 'occasion',      label: 'Occasion',            type: 'text'     },
      { key: 'keyTakeaways',  label: 'Key Takeaways',       type: 'textarea' },
    ],
    optionalFields: [
      { key: 'nextSteps', label: 'Next Steps / Follow-up', type: 'textarea' },
    ],
  },
};

module.exports = EMAIL_TEMPLATES;