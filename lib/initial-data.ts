import {
  Department,
  Employee,
  AttendanceRecord,
  AttendanceCorrection,
  LeaveRequest,
  LeaveBalance,
  HybridSchedule,
  Task,
  Meeting,
  Asset,
  RecruitmentJob,
  Candidate,
  OnboardingProcess,
  DocumentRecord,
  PerformanceReview,
  TrainingCourse,
  Announcement,
  Timesheet,
  OrganizationSettings,
  SystemAuditLog
} from './types';

export const initialDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'HR & Administration',
    code: 'CISD-HRA',
    headId: 'emp-3',
    description: 'Human talent management, institutional operations, facilities, and staff welfare.',
    location: 'Floor 3, Executive Wing, Abuja HQ',
    budget: '$380,000'
  },
  {
    id: 'dept-2',
    name: 'Research & Policy Dialogue',
    code: 'CISD-RPD',
    headId: 'emp-2',
    description: 'Strategic policy research, multilateral conflict analysis, and diplomatic dialogue facilitation.',
    location: 'Floor 4, Strategic Foresight Center, Abuja HQ',
    budget: '$1,250,000'
  },
  {
    id: 'dept-3',
    name: 'Finance & Accounts',
    code: 'CISD-FIN',
    headId: 'emp-4',
    description: 'Financial governance, donor grant accounting, budgetary control, and statutory audits.',
    location: 'Floor 3, Finance Suite, Abuja HQ',
    budget: '$420,000'
  },
  {
    id: 'dept-4',
    name: 'Communications & Strategic Media',
    code: 'CISD-CSM',
    headId: 'emp-5',
    description: 'Public diplomacy, international press relations, policy publications, and digital outreach.',
    location: 'Floor 2, Media Studio, Abuja HQ',
    budget: '$340,000'
  },
  {
    id: 'dept-5',
    name: 'Strategy, Partnerships & Programmes',
    code: 'CISD-SPP',
    headId: 'emp-6',
    description: 'Multilateral donor partnerships, programme delivery, diplomatic summits, and global missions.',
    location: 'Floor 5, Global Partnerships Wing, Abuja HQ',
    budget: '$980,000'
  }
];

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'CISD-001',
    firstName: 'Dr. Amina',
    lastName: 'Bello',
    email: 'amina.bello@cisdialogue.org',
    phone: '+234 803 111 2233',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-5',
    designation: 'Executive Director & Chief Executive',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2019-01-15',
    workLocation: 'Abuja Head Office (Executive Suite)',
    gradeLevel: 'Executive Level 1',
    personalInfo: {
      dob: '1976-04-12',
      gender: 'Female',
      maritalStatus: 'Married',
      nationality: 'Nigerian',
      address: 'Plot 422, Diplomatic Enclave, Maitama, Abuja',
      bloodGroup: 'O+',
      ninOrPassport: 'A08942155'
    },
    education: [
      { degree: 'Ph.D. in International Relations & Geopolitics', institution: 'University of Oxford', year: '2006', field: 'Strategic Studies' },
      { degree: 'M.Sc. in Conflict Resolution', institution: 'London School of Economics', year: '2001', field: 'International Affairs' }
    ],
    workExperience: [
      { company: 'United Nations Department of Political Affairs', role: 'Senior Strategic Advisor', fromYear: '2009', toYear: '2018', highlights: 'Led bilateral mediation efforts across West and Central Africa.' },
      { company: 'Kofi Annan International Peacekeeping Centre', role: 'Research Fellow', fromYear: '2006', toYear: '2009', highlights: 'Authored 14 landmark policy briefs on regional security architectures.' }
    ],
    emergencyContacts: [
      { name: 'Dr. Farouk Bello', relationship: 'Spouse', phone: '+234 802 444 8899', email: 'farouk.bello@medcentre.org' }
    ],
    dependants: [
      { name: 'Khadija Bello', relationship: 'Daughter', dob: '2011-08-20' },
      { name: 'Zayn Bello', relationship: 'Son', dob: '2015-02-14' }
    ],
    salaryGrade: 'EXEC-A1'
  },
  {
    id: 'emp-2',
    employeeId: 'CISD-002',
    firstName: 'Amb. Ibrahim',
    lastName: 'Mukhtar',
    email: 'ibrahim.mukhtar@cisdialogue.org',
    phone: '+234 809 333 4455',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-2',
    designation: 'Director of Research & Policy Dialogue',
    role: 'LINE_MANAGER',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2020-03-01',
    reportingManagerId: 'emp-1',
    workLocation: 'Abuja Head Office (Floor 4)',
    gradeLevel: 'Director Level 2',
    personalInfo: {
      dob: '1968-09-24',
      gender: 'Male',
      maritalStatus: 'Married',
      nationality: 'Nigerian',
      address: 'No 18, Lake Chad Crescent, Maitama, Abuja',
      bloodGroup: 'A+',
      ninOrPassport: 'B11942001'
    },
    education: [
      { degree: 'M.A. in Diplomatic Studies', institution: 'Georgetown University', year: '1995', field: 'Foreign Policy' }
    ],
    workExperience: [
      { company: 'Ministry of Foreign Affairs', role: 'Ambassador Plenipotentiary', fromYear: '2004', toYear: '2019', highlights: 'Served as Special Envoy to the African Union and Geneva.' }
    ],
    emergencyContacts: [
      { name: 'Hajiya Maryam Mukhtar', relationship: 'Spouse', phone: '+234 803 777 9900', email: 'maryam.mukhtar@yahoo.com' }
    ],
    dependants: [
      { name: 'Umar Mukhtar', relationship: 'Son', dob: '2004-11-05' }
    ],
    salaryGrade: 'DIR-D2'
  },
  {
    id: 'emp-3',
    employeeId: 'CISD-003',
    firstName: 'Olumide',
    lastName: 'Adeyemi',
    email: 'olumide.adeyemi@cisdialogue.org',
    phone: '+234 802 555 6677',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-1',
    designation: 'Director of HR & Administration',
    role: 'HR_ADMIN',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2020-07-15',
    reportingManagerId: 'emp-1',
    workLocation: 'Abuja Head Office (Floor 3)',
    gradeLevel: 'Director Level 2',
    personalInfo: {
      dob: '1979-11-18',
      gender: 'Male',
      maritalStatus: 'Married',
      nationality: 'Nigerian',
      address: '24 Nile Street, Sun City, Abuja',
      bloodGroup: 'O+',
      ninOrPassport: 'NIN-99482104'
    },
    education: [
      { degree: 'M.Sc. Human Resource Management', institution: 'University of Manchester', year: '2007', field: 'Human Resources' },
      { degree: 'B.Sc. Public Administration', institution: 'University of Ibadan', year: '2002', field: 'Social Sciences' }
    ],
    workExperience: [
      { company: 'ECOWAS Commission', role: 'Principal HR Specialist', fromYear: '2012', toYear: '2020', highlights: 'Directed multinational recruitment and staff performance management.' }
    ],
    emergencyContacts: [
      { name: 'Tolulope Adeyemi', relationship: 'Spouse', phone: '+234 803 123 7890', email: 'tolu.adeyemi@gmail.com' }
    ],
    dependants: [
      { name: 'Tiwa Adeyemi', relationship: 'Daughter', dob: '2014-06-11' },
      { name: 'Femi Adeyemi', relationship: 'Son', dob: '2018-09-02' }
    ],
    salaryGrade: 'DIR-D2'
  },
  {
    id: 'emp-4',
    employeeId: 'CISD-004',
    firstName: 'Ngozi',
    lastName: 'Eze',
    email: 'ngozi.eze@cisdialogue.org',
    phone: '+234 803 666 7788',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-3',
    designation: 'Director of Finance & Accounts',
    role: 'LINE_MANAGER',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2021-02-01',
    reportingManagerId: 'emp-1',
    workLocation: 'Abuja Head Office (Floor 3)',
    gradeLevel: 'Director Level 2',
    personalInfo: {
      dob: '1982-03-30',
      gender: 'Female',
      maritalStatus: 'Married',
      nationality: 'Nigerian',
      address: '15 Rhine Street, Maitama, Abuja',
      bloodGroup: 'B+',
      ninOrPassport: 'A77219044'
    },
    education: [
      { degree: 'FCA, Fellow of the Institute of Chartered Accountants of Nigeria (ICAN)', institution: 'ICAN', year: '2010', field: 'Chartered Accountancy' },
      { degree: 'B.Sc. Accounting', institution: 'University of Nigeria, Nsukka', year: '2004', field: 'Accounting' }
    ],
    workExperience: [
      { company: 'PwC West Africa', role: 'Senior Audit Manager', fromYear: '2014', toYear: '2021', highlights: 'Led NGO and public sector governance assurance audits.' }
    ],
    emergencyContacts: [
      { name: 'Emeka Eze', relationship: 'Spouse', phone: '+234 802 888 1122', email: 'emeka.eze@techgroup.ng' }
    ],
    dependants: [
      { name: 'Chisom Eze', relationship: 'Daughter', dob: '2016-12-04' }
    ],
    salaryGrade: 'DIR-D2'
  },
  {
    id: 'emp-5',
    employeeId: 'CISD-005',
    firstName: 'Fatima',
    lastName: 'Al-Hassan',
    email: 'fatima.alhassan@cisdialogue.org',
    phone: '+234 805 777 8899',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-4',
    designation: 'Head of Communications & Strategic Media',
    role: 'LINE_MANAGER',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2021-09-15',
    reportingManagerId: 'emp-1',
    workLocation: 'Abuja Head Office (Floor 2)',
    gradeLevel: 'Head Level 3',
    personalInfo: {
      dob: '1985-07-19',
      gender: 'Female',
      maritalStatus: 'Single',
      nationality: 'Nigerian',
      address: '8 Euphrates Street, Wuse 2, Abuja',
      bloodGroup: 'O+',
      ninOrPassport: 'NIN-18490219'
    },
    education: [
      { degree: 'M.A. Strategic Communications', institution: 'Columbia University', year: '2012', field: 'Journalism & Media' }
    ],
    workExperience: [
      { company: 'Al Jazeera Media Network', role: 'Diplomatic Producer', fromYear: '2015', toYear: '2021', highlights: 'Covered AU summits and global strategic dialogues.' }
    ],
    emergencyContacts: [
      { name: 'Bashir Al-Hassan', relationship: 'Brother', phone: '+234 803 999 0011', email: 'bashir.al@capital.ng' }
    ],
    dependants: [],
    salaryGrade: 'MGR-M1'
  },
  {
    id: 'emp-6',
    employeeId: 'CISD-006',
    firstName: 'Tariq',
    lastName: 'Mansoor',
    email: 'tariq.mansoor@cisdialogue.org',
    phone: '+234 806 888 9900',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-5',
    designation: 'Head of Strategy, Partnerships & Programmes',
    role: 'LINE_MANAGER',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2022-01-10',
    reportingManagerId: 'emp-1',
    workLocation: 'Abuja Head Office (Floor 5)',
    gradeLevel: 'Head Level 3',
    personalInfo: {
      dob: '1981-12-03',
      gender: 'Male',
      maritalStatus: 'Married',
      nationality: 'Nigerian',
      address: '21 Amazon Street, Maitama, Abuja',
      bloodGroup: 'A-',
      ninOrPassport: 'A99201443'
    },
    education: [
      { degree: 'M.Sc. Global Development Policy', institution: 'Harvard Kennedy School', year: '2010', field: 'Public Policy' }
    ],
    workExperience: [
      { company: 'African Development Bank (AfDB)', role: 'Senior Programme Officer', fromYear: '2013', toYear: '2021', highlights: 'Managed $45M international multilateral cooperation portfolio.' }
    ],
    emergencyContacts: [
      { name: 'Zuhra Mansoor', relationship: 'Spouse', phone: '+234 809 111 5566', email: 'zuhra.m@outlook.com' }
    ],
    dependants: [
      { name: 'Adam Mansoor', relationship: 'Son', dob: '2017-05-18' }
    ],
    salaryGrade: 'MGR-M1'
  },
  {
    id: 'emp-7',
    employeeId: 'CISD-007',
    firstName: 'Dr. Chidi',
    lastName: 'Okonkwo',
    email: 'chidi.okonkwo@cisdialogue.org',
    phone: '+234 803 999 1122',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-2',
    designation: 'Senior Strategic Policy Fellow',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    employmentType: 'FELLOW',
    joinDate: '2022-06-01',
    reportingManagerId: 'emp-2',
    workLocation: 'Hybrid (Abuja / Geneva)',
    gradeLevel: 'Senior Fellow Level 4',
    personalInfo: {
      dob: '1984-05-15',
      gender: 'Male',
      maritalStatus: 'Married',
      nationality: 'Nigerian',
      address: '14 Zambezi Crescent, Maitama, Abuja',
      bloodGroup: 'O+',
      ninOrPassport: 'NIN-44589201'
    },
    education: [
      { degree: 'Ph.D. Political Science', institution: 'University of Cambridge', year: '2015', field: 'Geopolitical Economies' }
    ],
    workExperience: [
      { company: 'Chatham House', role: 'Consulting Research Associate', fromYear: '2017', toYear: '2022', highlights: 'Authored trade and regional integration studies.' }
    ],
    emergencyContacts: [
      { name: 'Adaora Okonkwo', relationship: 'Spouse', phone: '+234 802 333 9911', email: 'adaora.o@yahoo.com' }
    ],
    dependants: [
      { name: 'Ifeanyi Okonkwo', relationship: 'Son', dob: '2019-01-22' }
    ],
    salaryGrade: 'FEL-F1'
  },
  {
    id: 'emp-8',
    employeeId: 'CISD-008',
    firstName: 'Zainab',
    lastName: 'Abubakar',
    email: 'zainab.abubakar@cisdialogue.org',
    phone: '+234 807 111 4433',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-1',
    designation: 'Senior HR & Talent Officer',
    role: 'HR_ADMIN',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2022-10-15',
    reportingManagerId: 'emp-3',
    workLocation: 'Abuja Head Office (Floor 3)',
    gradeLevel: 'Senior Officer Level 4',
    personalInfo: {
      dob: '1989-08-11',
      gender: 'Female',
      maritalStatus: 'Single',
      nationality: 'Nigerian',
      address: '12 Gana Street, Maitama, Abuja',
      bloodGroup: 'B+',
      ninOrPassport: 'NIN-89302114'
    },
    education: [
      { degree: 'B.Sc. Industrial Relations & Personnel Management', institution: 'University of Lagos', year: '2011', field: 'Human Resources' }
    ],
    workExperience: [
      { company: 'Heirs Holdings', role: 'HR Specialist', fromYear: '2016', toYear: '2022', highlights: 'Employee engagement, compensation, and onboarding.' }
    ],
    emergencyContacts: [
      { name: 'Aliyu Abubakar', relationship: 'Father', phone: '+234 803 222 6677', email: 'aliyu.ab@kano.gov.ng' }
    ],
    dependants: [],
    salaryGrade: 'OFF-O2'
  },
  {
    id: 'emp-9',
    employeeId: 'CISD-009',
    firstName: 'Babatunde',
    lastName: 'Fashina',
    email: 'babatunde.fashina@cisdialogue.org',
    phone: '+234 802 222 8833',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-3',
    designation: 'Senior Financial Analyst & Grant Controller',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2023-01-20',
    reportingManagerId: 'emp-4',
    workLocation: 'Abuja Head Office (Floor 3)',
    gradeLevel: 'Senior Officer Level 4',
    personalInfo: {
      dob: '1988-02-17',
      gender: 'Male',
      maritalStatus: 'Married',
      nationality: 'Nigerian',
      address: '6 Victoria Falls Street, Maitama, Abuja',
      bloodGroup: 'O+',
      ninOrPassport: 'A90214881'
    },
    education: [
      { degree: 'B.Sc. Finance & Banking', institution: 'Obafemi Awolowo University', year: '2010', field: 'Finance' }
    ],
    workExperience: [
      { company: 'KPMG Nigeria', role: 'Grant Advisory Associate', fromYear: '2015', toYear: '2022', highlights: 'Donor grant financial accountability and forecasting.' }
    ],
    emergencyContacts: [
      { name: 'Funmilayo Fashina', relationship: 'Spouse', phone: '+234 809 444 1188', email: 'funmi.fash@gmail.com' }
    ],
    dependants: [
      { name: 'Kayode Fashina', relationship: 'Son', dob: '2021-04-10' }
    ],
    salaryGrade: 'OFF-O2'
  },
  {
    id: 'emp-10',
    employeeId: 'CISD-010',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@cisdialogue.org',
    phone: '+234 806 777 0044',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-2',
    designation: 'International Dialogue & Multilateral Specialist',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    employmentType: 'CONTRACT',
    joinDate: '2023-05-01',
    reportingManagerId: 'emp-2',
    workLocation: 'Hybrid (Abuja / Vienna)',
    gradeLevel: 'Senior Specialist Level 4',
    personalInfo: {
      dob: '1987-10-09',
      gender: 'Female',
      maritalStatus: 'Single',
      nationality: 'Austrian / International Staff',
      address: 'Apartment 4B, Southern Sun Residences, Abuja',
      bloodGroup: 'A+',
      ninOrPassport: 'P-AT884920'
    },
    education: [
      { degree: 'Master of Advanced International Studies', institution: 'Diplomatic Academy of Vienna', year: '2013', field: 'European Affairs' }
    ],
    workExperience: [
      { company: 'OSCE Secretariat', role: 'Policy Officer', fromYear: '2016', toYear: '2023', highlights: 'Track II diplomacy and multilateral confidence building.' }
    ],
    emergencyContacts: [
      { name: 'Dr. Klaus Rostova', relationship: 'Father', phone: '+43 676 123 4567', email: 'klaus.rostova@univie.ac.at' }
    ],
    dependants: [],
    salaryGrade: 'SPEC-S1'
  },
  {
    id: 'emp-11',
    employeeId: 'CISD-011',
    firstName: 'David',
    lastName: 'Kalu',
    email: 'david.kalu@cisdialogue.org',
    phone: '+234 803 555 9900',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-1',
    designation: 'IT Infrastructure & Digital Security Lead',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2023-08-15',
    reportingManagerId: 'emp-3',
    workLocation: 'Abuja Head Office (Floor 3)',
    gradeLevel: 'Lead Officer Level 4',
    personalInfo: {
      dob: '1991-01-28',
      gender: 'Male',
      maritalStatus: 'Single',
      nationality: 'Nigerian',
      address: 'Plot 10, Jabi Lake Vista, Abuja',
      bloodGroup: 'O-',
      ninOrPassport: 'NIN-55092144'
    },
    education: [
      { degree: 'B.Eng. Computer Engineering', institution: 'Covenant University', year: '2013', field: 'Cybersecurity' }
    ],
    workExperience: [
      { company: 'MainOne Cables', role: 'Network & Cloud Engineer', fromYear: '2017', toYear: '2023', highlights: 'Zero-trust infrastructure and enterprise identity management.' }
    ],
    emergencyContacts: [
      { name: 'Grace Kalu', relationship: 'Mother', phone: '+234 803 777 4411', email: 'grace.kalu@gmail.com' }
    ],
    dependants: [],
    salaryGrade: 'OFF-O2'
  },
  {
    id: 'emp-12',
    employeeId: 'CISD-012',
    firstName: 'Maryam',
    lastName: 'Danjuma',
    email: 'maryam.danjuma@cisdialogue.org',
    phone: '+234 805 111 6622',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-4',
    designation: 'Digital Communications & Publications Officer',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2024-02-01',
    reportingManagerId: 'emp-5',
    workLocation: 'Abuja Head Office (Floor 2)',
    gradeLevel: 'Officer Level 5',
    personalInfo: {
      dob: '1994-06-25',
      gender: 'Female',
      maritalStatus: 'Single',
      nationality: 'Nigerian',
      address: '18 Aguiyi Ironsi Way, Maitama, Abuja',
      bloodGroup: 'A+',
      ninOrPassport: 'NIN-77382910'
    },
    education: [
      { degree: 'B.A. Mass Communication', institution: 'Ahmadu Bello University', year: '2016', field: 'Journalism' }
    ],
    workExperience: [
      { company: 'Channels Television', role: 'Digital News Editor', fromYear: '2018', toYear: '2024', highlights: 'Content strategy, social broadcasting, and diplomatic coverage.' }
    ],
    emergencyContacts: [
      { name: 'Suleiman Danjuma', relationship: 'Brother', phone: '+234 802 999 4455', email: 'sule.d@telecom.ng' }
    ],
    dependants: [],
    salaryGrade: 'OFF-O1'
  },
  {
    id: 'emp-13',
    employeeId: 'CISD-013',
    firstName: 'Emmanuel',
    lastName: 'Kwesi',
    email: 'emmanuel.kwesi@cisdialogue.org',
    phone: '+234 807 444 3322',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-5',
    designation: 'Programme Coordinator - West Africa & Sahel',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2024-04-15',
    reportingManagerId: 'emp-6',
    workLocation: 'Abuja Head Office (Floor 5)',
    gradeLevel: 'Officer Level 5',
    personalInfo: {
      dob: '1990-09-14',
      gender: 'Male',
      maritalStatus: 'Married',
      nationality: 'Ghanaian / ECOWAS Resident',
      address: 'Block C4, Diplomatic Quarters, Garki, Abuja',
      bloodGroup: 'O+',
      ninOrPassport: 'GHA-8849201'
    },
    education: [
      { degree: 'M.A. Peace & Development Studies', institution: 'University of Cape Coast', year: '2015', field: 'Peace Studies' }
    ],
    workExperience: [
      { company: 'West Africa Network for Peacebuilding (WANEP)', role: 'Programme Officer', fromYear: '2017', toYear: '2024', highlights: 'Managed civil society dialogues in Mali and Niger.' }
    ],
    emergencyContacts: [
      { name: 'Abena Kwesi', relationship: 'Spouse', phone: '+233 24 123 4567', email: 'abena.kwesi@ghana.com' }
    ],
    dependants: [
      { name: 'Kofi Kwesi', relationship: 'Son', dob: '2022-03-12' }
    ],
    salaryGrade: 'OFF-O1'
  },
  {
    id: 'emp-14',
    employeeId: 'CISD-014',
    firstName: 'Aisha',
    lastName: 'Mohammed',
    email: 'aisha.mohammed@cisdialogue.org',
    phone: '+234 809 666 5511',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-2',
    designation: 'Research Analyst - Energy & Climate Transition',
    role: 'EMPLOYEE',
    status: 'ON_PROBATION',
    employmentType: 'FULL_TIME',
    joinDate: '2026-08-01',
    probationEndDate: '2026-11-01',
    reportingManagerId: 'emp-2',
    workLocation: 'Abuja Head Office (Floor 4)',
    gradeLevel: 'Associate Level 6',
    personalInfo: {
      dob: '1996-03-18',
      gender: 'Female',
      maritalStatus: 'Single',
      nationality: 'Nigerian',
      address: '27 Adetokunbo Ademola Crescent, Wuse 2, Abuja',
      bloodGroup: 'B-',
      ninOrPassport: 'NIN-99104829'
    },
    education: [
      { degree: 'M.Sc. Energy Politics & Geopolitics', institution: 'Imperial College London', year: '2023', field: 'Energy Transition' }
    ],
    workExperience: [
      { company: 'African Energy Chamber', role: 'Junior Research Analyst', fromYear: '2023', toYear: '2026', highlights: 'Synthesized critical mineral supply chain data for African policymakers.' }
    ],
    emergencyContacts: [
      { name: 'Dr. Haliru Mohammed', relationship: 'Father', phone: '+234 803 888 7722', email: 'h.mohammed@consult.ng' }
    ],
    dependants: [],
    salaryGrade: 'ASC-A1'
  },
  {
    id: 'emp-15',
    employeeId: 'CISD-015',
    firstName: 'Samuel',
    lastName: 'Adeleke',
    email: 'samuel.adeleke@cisdialogue.org',
    phone: '+234 802 777 3344',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    departmentId: 'dept-1',
    designation: 'Procurement & Administrative Officer',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    employmentType: 'FULL_TIME',
    joinDate: '2024-06-01',
    reportingManagerId: 'emp-3',
    workLocation: 'Abuja Head Office (Floor 3)',
    gradeLevel: 'Officer Level 5',
    personalInfo: {
      dob: '1992-11-02',
      gender: 'Male',
      maritalStatus: 'Single',
      nationality: 'Nigerian',
      address: '14 Bissau Street, Wuse Zone 6, Abuja',
      bloodGroup: 'O+',
      ninOrPassport: 'NIN-66291044'
    },
    education: [
      { degree: 'B.Sc. Supply Chain Management', institution: 'Federal University of Technology, Akure', year: '2014', field: 'Logistics' }
    ],
    workExperience: [
      { company: 'DHL Global Forwarding', role: 'Operations Officer', fromYear: '2018', toYear: '2024', highlights: 'Procurement, vendor compliance, and asset tracking.' }
    ],
    emergencyContacts: [
      { name: 'Kemi Adeleke', relationship: 'Sister', phone: '+234 803 444 8811', email: 'kemi.adeleke@gmail.com' }
    ],
    dependants: [],
    salaryGrade: 'OFF-O1'
  }
];

export const initialAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    date: '2026-11-05',
    clockIn: '08:15',
    status: 'PRESENT',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (Executive Suite)',
    workingHours: 8.5,
    latenessMinutes: 0
  },
  {
    id: 'att-2',
    employeeId: 'emp-2',
    date: '2026-11-05',
    clockIn: '08:45',
    status: 'PRESENT',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (Floor 4)',
    workingHours: 8.0,
    latenessMinutes: 0
  },
  {
    id: 'att-3',
    employeeId: 'emp-3',
    date: '2026-11-05',
    clockIn: '08:30',
    status: 'PRESENT',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (Floor 3)',
    workingHours: 8.2,
    latenessMinutes: 0
  },
  {
    id: 'att-4',
    employeeId: 'emp-4',
    date: '2026-11-05',
    clockIn: '09:12',
    status: 'LATE',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (Floor 3)',
    workingHours: 7.5,
    latenessMinutes: 27,
    notes: 'Airport delay returning from donor consultation'
  },
  {
    id: 'att-5',
    employeeId: 'emp-5',
    date: '2026-11-05',
    clockIn: '08:50',
    status: 'PRESENT',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (Floor 2)',
    workingHours: 8.0,
    latenessMinutes: 0
  },
  {
    id: 'att-6',
    employeeId: 'emp-6',
    date: '2026-11-05',
    clockIn: '08:20',
    status: 'PRESENT',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (Floor 5)',
    workingHours: 8.3,
    latenessMinutes: 0
  },
  {
    id: 'att-7',
    employeeId: 'emp-7',
    date: '2026-11-05',
    clockIn: '08:55',
    status: 'REMOTE',
    workType: 'REMOTE',
    locationName: 'Geneva Liaison Office',
    workingHours: 8.0,
    latenessMinutes: 0
  },
  {
    id: 'att-8',
    employeeId: 'emp-8',
    date: '2026-11-05',
    clockIn: '08:25',
    status: 'PRESENT',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (Floor 3)',
    workingHours: 8.2,
    latenessMinutes: 0
  },
  {
    id: 'att-9',
    employeeId: 'emp-9',
    date: '2026-11-05',
    clockIn: '08:40',
    status: 'REMOTE',
    workType: 'REMOTE',
    locationName: 'Approved Home Office (Abuja)',
    workingHours: 8.0,
    latenessMinutes: 0
  },
  {
    id: 'att-10',
    employeeId: 'emp-10',
    date: '2026-11-05',
    clockIn: '09:00',
    status: 'REMOTE',
    workType: 'REMOTE',
    locationName: 'Vienna Strategic Centre',
    workingHours: 8.0,
    latenessMinutes: 0
  },
  {
    id: 'att-11',
    employeeId: 'emp-11',
    date: '2026-11-05',
    clockIn: '08:10',
    status: 'PRESENT',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (IT Server Room)',
    workingHours: 8.5,
    latenessMinutes: 0
  },
  {
    id: 'att-12',
    employeeId: 'emp-12',
    date: '2026-11-05',
    clockIn: '08:45',
    status: 'PRESENT',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (Media Studio)',
    workingHours: 8.0,
    latenessMinutes: 0
  },
  {
    id: 'att-13',
    employeeId: 'emp-13',
    date: '2026-11-05',
    clockIn: '08:35',
    status: 'PRESENT',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (Floor 5)',
    workingHours: 8.1,
    latenessMinutes: 0
  },
  {
    id: 'att-14',
    employeeId: 'emp-14',
    date: '2026-11-05',
    clockIn: '08:40',
    status: 'PRESENT',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (Floor 4)',
    workingHours: 8.1,
    latenessMinutes: 0
  },
  {
    id: 'att-15',
    employeeId: 'emp-15',
    date: '2026-11-05',
    clockIn: '08:30',
    status: 'PRESENT',
    workType: 'OFFICE',
    locationName: 'Abuja Head Office (Floor 3)',
    workingHours: 8.2,
    latenessMinutes: 0
  }
];

export const initialAttendanceCorrections: AttendanceCorrection[] = [
  {
    id: 'cor-1',
    employeeId: 'emp-4',
    date: '2026-11-04',
    requestedClockIn: '08:30',
    requestedClockOut: '17:30',
    reason: 'Biometric fingerprint reader failed during morning power transition.',
    status: 'PENDING'
  }
];

export const initialLeaveBalances: LeaveBalance[] = [
  { employeeId: 'emp-1', annualTotal: 25, annualUsed: 8, sickTotal: 12, sickUsed: 1, casualTotal: 5, casualUsed: 1, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-2', annualTotal: 25, annualUsed: 12, sickTotal: 12, sickUsed: 2, casualTotal: 5, casualUsed: 2, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-3', annualTotal: 25, annualUsed: 6, sickTotal: 12, sickUsed: 0, casualTotal: 5, casualUsed: 1, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-4', annualTotal: 25, annualUsed: 10, sickTotal: 12, sickUsed: 3, casualTotal: 5, casualUsed: 0, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-5', annualTotal: 22, annualUsed: 7, sickTotal: 12, sickUsed: 1, casualTotal: 5, casualUsed: 2, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-6', annualTotal: 22, annualUsed: 5, sickTotal: 12, sickUsed: 0, casualTotal: 5, casualUsed: 1, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-7', annualTotal: 21, annualUsed: 9, sickTotal: 12, sickUsed: 0, casualTotal: 5, casualUsed: 0, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-8', annualTotal: 21, annualUsed: 4, sickTotal: 12, sickUsed: 1, casualTotal: 5, casualUsed: 1, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-9', annualTotal: 21, annualUsed: 8, sickTotal: 12, sickUsed: 0, casualTotal: 5, casualUsed: 2, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-10', annualTotal: 21, annualUsed: 11, sickTotal: 12, sickUsed: 2, casualTotal: 5, casualUsed: 1, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-11', annualTotal: 21, annualUsed: 3, sickTotal: 12, sickUsed: 0, casualTotal: 5, casualUsed: 0, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-12', annualTotal: 21, annualUsed: 2, sickTotal: 12, sickUsed: 0, casualTotal: 5, casualUsed: 1, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-13', annualTotal: 21, annualUsed: 5, sickTotal: 12, sickUsed: 1, casualTotal: 5, casualUsed: 0, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-14', annualTotal: 14, annualUsed: 0, sickTotal: 8, sickUsed: 0, casualTotal: 3, casualUsed: 0, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 },
  { employeeId: 'emp-15', annualTotal: 21, annualUsed: 1, sickTotal: 12, sickUsed: 0, casualTotal: 5, casualUsed: 0, maternityPaternityTotal: 0, maternityPaternityUsed: 0, unpaidUsed: 0 }
];

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-7',
    leaveType: 'ANNUAL',
    startDate: '2026-11-16',
    endDate: '2026-11-20',
    daysCount: 5,
    reason: 'Annual family break following completion of the Sahel Policy Monograph.',
    handoverEmployeeId: 'emp-10',
    status: 'PENDING',
    appliedDate: '2026-11-03'
  },
  {
    id: 'leave-2',
    employeeId: 'emp-9',
    leaveType: 'CASUAL',
    startDate: '2026-11-12',
    endDate: '2026-11-13',
    daysCount: 2,
    reason: 'Family engagement ceremonies in Lagos.',
    handoverEmployeeId: 'emp-4',
    status: 'APPROVED',
    appliedDate: '2026-10-28',
    approvedBy: 'emp-4',
    approvalNotes: 'Approved. Ensure grant reconciliation reports are completed before departure.'
  },
  {
    id: 'leave-3',
    employeeId: 'emp-12',
    leaveType: 'STUDY',
    startDate: '2026-11-23',
    endDate: '2026-11-27',
    daysCount: 5,
    reason: 'Attending Executive Certificate in International Crisis Communications (London virtual session).',
    handoverEmployeeId: 'emp-5',
    status: 'APPROVED',
    appliedDate: '2026-10-30',
    approvedBy: 'emp-5',
    approvalNotes: 'Approved. Approved for professional development subsidy.'
  }
];

export const initialHybridSchedules: HybridSchedule[] = [
  {
    id: 'sch-1',
    employeeId: 'emp-1',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'OFFICE',
    wednesday: 'OFFICE',
    thursday: 'OFFICE',
    friday: 'REMOTE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-2',
    employeeId: 'emp-2',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'OFFICE',
    wednesday: 'REMOTE',
    thursday: 'OFFICE',
    friday: 'OFFICE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-3',
    employeeId: 'emp-3',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'OFFICE',
    wednesday: 'OFFICE',
    thursday: 'REMOTE',
    friday: 'OFFICE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-4',
    employeeId: 'emp-4',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'OFFICE',
    wednesday: 'OFFICE',
    thursday: 'OFFICE',
    friday: 'REMOTE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-5',
    employeeId: 'emp-5',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'REMOTE',
    wednesday: 'OFFICE',
    thursday: 'OFFICE',
    friday: 'REMOTE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-6',
    employeeId: 'emp-6',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'OFFICE',
    wednesday: 'OFFICE',
    thursday: 'OFFICE',
    friday: 'REMOTE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-7',
    employeeId: 'emp-7',
    weekStartDate: '2026-11-02',
    monday: 'REMOTE',
    tuesday: 'REMOTE',
    wednesday: 'OFFICE',
    thursday: 'REMOTE',
    friday: 'REMOTE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-8',
    employeeId: 'emp-8',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'OFFICE',
    wednesday: 'OFFICE',
    thursday: 'REMOTE',
    friday: 'OFFICE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-9',
    employeeId: 'emp-9',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'OFFICE',
    wednesday: 'REMOTE',
    thursday: 'REMOTE',
    friday: 'OFFICE',
    status: 'ACTIVE',
    changeRequests: [
      {
        id: 'cr-1',
        targetDate: '2026-11-06',
        originalStatus: 'OFFICE',
        requestedStatus: 'REMOTE',
        reason: 'Consolidating donor financial files from home workspace.',
        status: 'PENDING',
        appliedAt: '2026-11-04'
      }
    ]
  },
  {
    id: 'sch-10',
    employeeId: 'emp-10',
    weekStartDate: '2026-11-02',
    monday: 'REMOTE',
    tuesday: 'REMOTE',
    wednesday: 'REMOTE',
    thursday: 'REMOTE',
    friday: 'REMOTE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-11',
    employeeId: 'emp-11',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'OFFICE',
    wednesday: 'OFFICE',
    thursday: 'OFFICE',
    friday: 'OFFICE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-12',
    employeeId: 'emp-12',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'REMOTE',
    wednesday: 'OFFICE',
    thursday: 'OFFICE',
    friday: 'OFFICE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-13',
    employeeId: 'emp-13',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'OFFICE',
    wednesday: 'OFFICE',
    thursday: 'REMOTE',
    friday: 'OFFICE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-14',
    employeeId: 'emp-14',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'OFFICE',
    wednesday: 'OFFICE',
    thursday: 'OFFICE',
    friday: 'REMOTE',
    status: 'ACTIVE'
  },
  {
    id: 'sch-15',
    employeeId: 'emp-15',
    weekStartDate: '2026-11-02',
    monday: 'OFFICE',
    tuesday: 'OFFICE',
    wednesday: 'OFFICE',
    thursday: 'OFFICE',
    friday: 'REMOTE',
    status: 'ACTIVE'
  }
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Finalize Sahel Security Strategic Dialogue Dossier',
    description: 'Compile briefing packages for 12 regional delegation heads arriving for the November ministerial dialogue.',
    departmentId: 'dept-2',
    assignedToId: 'emp-7',
    createdById: 'emp-2',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    dueDate: '2026-11-08',
    progressPercentage: 75,
    projectTag: 'Sahel Dialogue 2026'
  },
  {
    id: 'task-2',
    title: 'Complete Q3 2026 Donor Financial Audit Documentation',
    description: 'Reconcile MacArthur Foundation and EU Foreign Policy grants for submission to external auditors.',
    departmentId: 'dept-3',
    assignedToId: 'emp-9',
    createdById: 'emp-4',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: '2026-11-10',
    progressPercentage: 60,
    projectTag: 'Audit & Compliance'
  },
  {
    id: 'task-3',
    title: 'Roll Out Zero-Trust Multi-Factor Identity for All Field Analysts',
    description: 'Enforce hardware security tokens and update remote VPN certificates for Geneva and Vienna liaisons.',
    departmentId: 'dept-1',
    assignedToId: 'emp-11',
    createdById: 'emp-3',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    dueDate: '2026-11-06',
    progressPercentage: 90,
    projectTag: 'Cyber Infrastructure'
  },
  {
    id: 'task-4',
    title: 'Draft Press Communiqué on AfCFTA Critical Minerals Consensus',
    description: 'Prepare bilateral policy statement in English and French for the international press corps.',
    departmentId: 'dept-4',
    assignedToId: 'emp-12',
    createdById: 'emp-5',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    dueDate: '2026-11-12',
    progressPercentage: 0,
    projectTag: 'AfCFTA Mineral Policy'
  },
  {
    id: 'task-5',
    title: 'Complete Onboarding Milestone 3 & Security Clearance for Aisha Mohammed',
    description: 'Verify security vetting documents and submit diplomatic passport recommendation.',
    departmentId: 'dept-1',
    assignedToId: 'emp-8',
    createdById: 'emp-3',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    dueDate: '2026-11-02',
    completedAt: '2026-11-02',
    progressPercentage: 100,
    projectTag: 'HR Operations'
  },
  {
    id: 'task-6',
    title: 'Annual Asset Physical Audit & Barcode Tagging',
    description: 'Inspect all CISD laptops, conference audio-visual rigs, and official vehicles across Abuja HQ.',
    departmentId: 'dept-1',
    assignedToId: 'emp-15',
    createdById: 'emp-3',
    priority: 'MEDIUM',
    status: 'OVERDUE',
    dueDate: '2026-11-03',
    progressPercentage: 40,
    projectTag: 'Asset Management'
  }
];

export const initialMeetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Executive Council Weekly Strategic Review',
    description: 'High-level weekly briefing on institutional dialogue mandates, diplomatic missions, and resource allocations.',
    type: 'EXECUTIVE_BRIEFING',
    date: '2026-11-05',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Executive Boardroom, Floor 5, Abuja HQ',
    isVirtual: true,
    virtualLink: 'https://dialogue.cisd.org/exec-council',
    organizerId: 'emp-1',
    participantIds: ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5', 'emp-6'],
    minutes: 'Reviewed Sahel ministerial preparation. Approved budget reallocation for Vienna liaison mission.',
    actionItems: [
      { id: 'act-1', task: 'Finalize diplomatic invitation letters for regional delegates', assignedToId: 'emp-2', status: 'DONE' },
      { id: 'act-2', task: 'Provide financial clearance for venue deposit', assignedToId: 'emp-4', status: 'OPEN' }
    ]
  },
  {
    id: 'meet-2',
    title: 'Sahel Security Ministerial Working Group Briefing',
    description: 'Pre-summit coordination with defense policy analysts and international observers.',
    type: 'STRATEGIC_DIALOGUE',
    date: '2026-11-06',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Diplomatic Conference Hall B, Abuja HQ',
    isVirtual: true,
    virtualLink: 'https://dialogue.cisd.org/sahel-working-group',
    organizerId: 'emp-2',
    participantIds: ['emp-2', 'emp-7', 'emp-10', 'emp-13'],
    actionItems: [
      { id: 'act-3', task: 'Distribute confidential policy draft to bilateral ambassadors', assignedToId: 'emp-7', status: 'OPEN' }
    ]
  },
  {
    id: 'meet-3',
    title: 'HR & Operations Bi-Weekly Sync',
    description: 'Review recruitment pipeline, onboarding status of research associates, and leave schedules.',
    type: 'DEPARTMENTAL',
    date: '2026-11-09',
    startTime: '09:30',
    endTime: '10:30',
    location: 'Conference Room 3A, Floor 3',
    isVirtual: false,
    organizerId: 'emp-3',
    participantIds: ['emp-3', 'emp-8', 'emp-11', 'emp-15'],
    actionItems: []
  }
];

export const initialAssets: Asset[] = [
  {
    id: 'asset-1',
    assetCode: 'CISD-IT-001',
    name: 'Apple MacBook Pro 16" M3 Max (36GB / 1TB)',
    category: 'LAPTOP',
    serialNumber: 'C02GK89VP938',
    acquisitionDate: '2024-01-15',
    assignedToId: 'emp-1',
    assignedDate: '2024-01-16',
    condition: 'EXCELLENT',
    status: 'ASSIGNED',
    location: 'Executive Office, Abuja HQ',
    maintenanceLogs: [
      { date: '2024-07-20', description: 'Firmware & CISD Enterprise Security Suite update', cost: 0, performedBy: 'David Kalu' }
    ]
  },
  {
    id: 'asset-2',
    assetCode: 'CISD-IT-002',
    name: 'Lenovo ThinkPad X1 Carbon Gen 11 (32GB / 1TB)',
    category: 'LAPTOP',
    serialNumber: 'PF3X8921B',
    acquisitionDate: '2023-04-10',
    assignedToId: 'emp-2',
    assignedDate: '2023-04-12',
    condition: 'EXCELLENT',
    status: 'ASSIGNED',
    location: 'Floor 4, Strategic Foresight Center',
    maintenanceLogs: []
  },
  {
    id: 'asset-3',
    assetCode: 'CISD-IT-003',
    name: 'Lenovo ThinkPad T14s Gen 4 (16GB / 512GB)',
    category: 'LAPTOP',
    serialNumber: 'PF4W9012K',
    acquisitionDate: '2023-08-01',
    assignedToId: 'emp-3',
    assignedDate: '2023-08-05',
    condition: 'GOOD',
    status: 'ASSIGNED',
    location: 'Floor 3, HR Suite',
    maintenanceLogs: []
  },
  {
    id: 'asset-4',
    assetCode: 'CISD-IT-004',
    name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
    category: 'MONITOR',
    serialNumber: 'CN-0K7918-72872',
    acquisitionDate: '2023-06-12',
    assignedToId: 'emp-4',
    assignedDate: '2023-06-15',
    condition: 'EXCELLENT',
    status: 'ASSIGNED',
    location: 'Floor 3, Finance Suite',
    maintenanceLogs: []
  },
  {
    id: 'asset-5',
    assetCode: 'CISD-MOB-001',
    name: 'Apple iPhone 15 Pro (256GB - Diplomatic Device)',
    category: 'PHONE',
    serialNumber: 'F2LWP0914K',
    acquisitionDate: '2024-02-10',
    assignedToId: 'emp-1',
    assignedDate: '2024-02-12',
    condition: 'EXCELLENT',
    status: 'ASSIGNED',
    location: 'Abuja / Diplomatic Transit',
    maintenanceLogs: []
  },
  {
    id: 'asset-6',
    assetCode: 'CISD-VEH-001',
    name: 'Toyota Land Cruiser Prado VX V6 (Official Diplomatic Escort)',
    category: 'VEHICLE',
    serialNumber: 'JTEBU5JR7K501928',
    acquisitionDate: '2022-05-18',
    assignedToId: 'emp-15',
    assignedDate: '2022-05-20',
    condition: 'GOOD',
    status: 'ASSIGNED',
    location: 'Abuja HQ Secure Motor Pool',
    maintenanceLogs: [
      { date: '2026-09-10', description: '50,000km periodic service, brake pads replacement and wheel alignment', cost: 320, performedBy: 'Toyota Abuja Service Center' }
    ]
  },
  {
    id: 'asset-7',
    assetCode: 'CISD-AV-001',
    name: 'Polycom RealPresence Group 700 Video Conference Suite',
    category: 'AUDIO_VISUAL',
    serialNumber: '8219042-0199',
    acquisitionDate: '2021-11-04',
    condition: 'GOOD',
    status: 'AVAILABLE',
    location: 'Executive Boardroom, Floor 5',
    maintenanceLogs: [
      { date: '2026-01-14', description: 'Microphone array firmware upgrade and calibration', cost: 0, performedBy: 'David Kalu' }
    ]
  },
  {
    id: 'asset-8',
    assetCode: 'CISD-IT-008',
    name: 'Lenovo ThinkPad T14s Gen 4 (Spare Pool)',
    category: 'LAPTOP',
    serialNumber: 'PF4W9099X',
    acquisitionDate: '2024-06-10',
    condition: 'EXCELLENT',
    status: 'AVAILABLE',
    location: 'IT Safe, Floor 3',
    maintenanceLogs: []
  }
];

export const initialRecruitmentJobs: RecruitmentJob[] = [
  {
    id: 'job-1',
    title: 'Senior Fellow on Geoeconomics & Critical Minerals',
    departmentId: 'dept-2',
    type: 'FELLOW',
    location: 'Abuja Head Office (with international travel)',
    experience: '8+ years post-Ph.D. or multilateral experience',
    openings: 1,
    deadline: '2026-11-30',
    status: 'OPEN',
    description: 'Lead policy dialogue tracks on global critical minerals supply chains, African value retention, and sovereign economic partnerships.',
    requirements: [
      'Ph.D. or Master’s in International Political Economy or Energy Governance',
      'Demonstrated Track 1.5 or Track 2 dialogue facilitation experience',
      'Publications in recognized foreign policy journals',
      'Fluency in English; working knowledge of French is an advantage'
    ],
    salaryRange: '$75,000 - $95,000 per annum'
  },
  {
    id: 'job-2',
    title: 'Bilingual Diplomatic Communications Officer (English / French)',
    departmentId: 'dept-4',
    type: 'FULL_TIME',
    location: 'Abuja Head Office',
    experience: '4-6 years in strategic communications or foreign service',
    openings: 1,
    deadline: '2026-11-20',
    status: 'INTERVIEWING',
    description: 'Manage media relations, diplomatic communiqués, bilingual press kits, and digital coverage of CISD strategic dialogues.',
    requirements: [
      'B.A. or M.A. in Communications, Journalism, or International Relations',
      'Native or near-native fluency in English and French (written and spoken)',
      'Experience handling high-level diplomatic protocols and VIP press pools'
    ],
    salaryRange: '$42,000 - $54,000 per annum'
  }
];

export const initialCandidates: Candidate[] = [
  {
    id: 'cand-1',
    jobId: 'job-2',
    fullName: 'Jean-Luc Kouassi',
    email: 'j.kouassi@abidjandialogue.org',
    phone: '+225 07 48 99 12',
    appliedDate: '2026-10-15',
    stage: 'INTERVIEW',
    resumeUrl: '/documents/resumes/kouassi-cv.pdf',
    interviewNotes: 'Excellent diplomatic demeanor. Fluent in French and English. Strong experience with AU summit press desks.',
    rating: 5,
    offerDetails: {
      salary: '$50,000 per annum',
      startDate: '2026-12-01',
      status: 'PENDING'
    }
  },
  {
    id: 'cand-2',
    jobId: 'job-2',
    fullName: 'Folashade Adele',
    email: 'folashade.adele@alumni.lse.ac.uk',
    phone: '+234 803 118 7200',
    appliedDate: '2026-10-18',
    stage: 'SCREENING',
    resumeUrl: '/documents/resumes/adele-cv.pdf',
    interviewNotes: 'Solid writing background with BBC Africa. Scheduling initial technical writing test.',
    rating: 4
  },
  {
    id: 'cand-3',
    jobId: 'job-1',
    fullName: 'Dr. Tariq Al-Mansoor',
    email: 'tariq.mansoor@oxfordfellows.org',
    phone: '+44 7700 900123',
    appliedDate: '2026-10-25',
    stage: 'APPLIED',
    resumeUrl: '/documents/resumes/almansoor-cv.pdf',
    rating: 4
  }
];

export const initialOnboardingProcesses: OnboardingProcess[] = [
  {
    id: 'onb-1',
    employeeId: 'emp-14',
    startDate: '2026-08-01',
    targetCompletionDate: '2026-11-01',
    progress: 80,
    status: 'IN_PROGRESS',
    tasks: [
      { id: 'ot-1', title: 'Submit certified copies of degree transcripts and international passport', category: 'DOCUMENT', isCompleted: true, completedAt: '2026-08-03', dueDate: '2026-08-05' },
      { id: 'ot-2', title: 'Sign CISD Code of Conduct & Diplomatic Neutrality Pledge', category: 'DOCUMENT', isCompleted: true, completedAt: '2026-08-04', dueDate: '2026-08-05' },
      { id: 'ot-3', title: 'Receive ThinkPad laptop and secure token configuration', category: 'IT_ASSET', isCompleted: true, completedAt: '2026-08-05', dueDate: '2026-08-06' },
      { id: 'ot-4', title: 'Attend CISD Institutional History & Mandate Orientation', category: 'ORIENTATION', isCompleted: true, completedAt: '2026-08-12', dueDate: '2026-08-15' },
      { id: 'ot-5', title: 'Complete 90-day probation review with Director of Research', category: 'ORIENTATION', isCompleted: false, dueDate: '2026-11-01' }
    ]
  }
];

export const initialDocuments: DocumentRecord[] = [
  {
    id: 'doc-1',
    title: 'CISD Employee Handbook & Institutional Governance Charter 2026',
    category: 'POLICY',
    fileType: 'PDF',
    fileSize: '4.8 MB',
    uploadedDate: '2026-01-10',
    uploadedById: 'emp-3',
    isCompanyWide: true,
    downloadUrl: '/docs/CISD_Employee_Handbook_2026.pdf',
    description: 'Comprehensive staff guidelines, ethics, hybrid work rules, and diplomatic protocol standards.'
  },
  {
    id: 'doc-2',
    title: 'CISD Hybrid Workplace & Remote Telework Policy',
    category: 'POLICY',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    uploadedDate: '2026-02-15',
    uploadedById: 'emp-3',
    isCompanyWide: true,
    downloadUrl: '/docs/CISD_Hybrid_Work_Policy.pdf',
    description: 'Framework governing 3-office/2-remote work distribution, schedule change requests, and data security.'
  },
  {
    id: 'doc-3',
    title: 'Executive Employment Contract - Dr. Amina Bello',
    category: 'CONTRACT',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    uploadedDate: '2019-01-15',
    uploadedById: 'emp-3',
    employeeId: 'emp-1',
    isCompanyWide: false,
    downloadUrl: '/docs/contracts/Bello_Amina_Contract.pdf'
  },
  {
    id: 'doc-4',
    title: 'Appointment Letter - Dr. Chidi Okonkwo',
    category: 'APPOINTMENT_LETTER',
    fileType: 'PDF',
    fileSize: '850 KB',
    uploadedDate: '2022-05-20',
    uploadedById: 'emp-3',
    employeeId: 'emp-7',
    isCompanyWide: false,
    downloadUrl: '/docs/appointments/Okonkwo_Chidi_Appointment.pdf'
  },
  {
    id: 'doc-5',
    title: 'Staff Travel & International Per Diem Expense Claim Form',
    category: 'FORM',
    fileType: 'XLSX',
    fileSize: '420 KB',
    uploadedDate: '2026-03-01',
    uploadedById: 'emp-4',
    isCompanyWide: true,
    downloadUrl: '/docs/forms/CISD_Travel_PerDiem_Claim.xlsx',
    description: 'Standard reimbursement template for official international dialogue travel.'
  }
];

export const initialPerformanceReviews: PerformanceReview[] = [
  {
    id: 'pr-1',
    employeeId: 'emp-7',
    reviewerId: 'emp-2',
    cycle: '2026 Mid-Year Strategic Review',
    status: 'FINALIZED',
    selfRating: 4.8,
    managerRating: 4.7,
    kpiRatings: [
      { title: 'Publication of Strategic Policy Papers', weight: 40, score: 5, comments: 'Published landmark Sahel paper cited by 4 multilateral bodies.' },
      { title: 'Track 1.5 Dialogue Facilitation', weight: 35, score: 4.5, comments: 'Moderated high-stakes closed sessions with remarkable diplomatic poise.' },
      { title: 'Inter-Departmental Collaboration', weight: 25, score: 4.5, comments: 'Seamless partnership with Communications on digital policy releases.' }
    ],
    strengths: 'Exceptional strategic intellect, deep credibility with diplomatic stakeholders, and articulate writing.',
    areasForGrowth: 'Could delegate initial research data compilation to junior research associates earlier in project timelines.',
    developmentPlan: 'Sponsored attendance at the 2027 Geneva Peacebuilding Forum and advanced multilateral crisis simulation.',
    finalScore: 4.7,
    createdAt: '2026-07-15'
  },
  {
    id: 'pr-2',
    employeeId: 'emp-9',
    reviewerId: 'emp-4',
    cycle: '2026 Mid-Year Strategic Review',
    status: 'FINALIZED',
    selfRating: 4.5,
    managerRating: 4.6,
    kpiRatings: [
      { title: 'Donor Grant Financial Reconciliation', weight: 40, score: 4.8, comments: 'Clean audit opinion obtained from external audit firms.' },
      { title: 'Budget Variance Monitoring', weight: 30, score: 4.5, comments: 'Maintained department expenditures within 3% of allocated ceilings.' },
      { title: 'Automated Financial Reporting', weight: 30, score: 4.5, comments: 'Introduced monthly real-time budget dashboard for directors.' }
    ],
    strengths: 'Rigorous attention to accounting detail, uncompromising compliance standards, and clear presentation.',
    areasForGrowth: 'Expand knowledge of international multi-currency hedging strategies for foreign grants.',
    developmentPlan: 'Enrolled in Oxford Executive Certificate in Global NGO Financial Leadership.',
    finalScore: 4.6,
    createdAt: '2026-07-20'
  }
];

export const initialTrainingCourses: TrainingCourse[] = [
  {
    id: 'tr-1',
    title: 'High-Stakes Diplomatic Negotiation & Mediation Techniques',
    code: 'CISD-TR-01',
    category: 'DIPLOMACY',
    instructor: 'Amb. Jean-Pierre Dufour (Ret. Swiss Diplomat)',
    durationHours: 16,
    scheduleDate: '2026-11-25',
    maxParticipants: 15,
    enrolledEmployeeIds: ['emp-2', 'emp-7', 'emp-10', 'emp-13'],
    completedEmployeeIds: ['emp-1'],
    description: 'Practical simulation-based workshop on backchannel communication, deadlocks, and bilateral mediation protocols.'
  },
  {
    id: 'tr-2',
    title: 'Artificial Intelligence & Strategic Foresight in Geopolitics',
    code: 'CISD-TR-02',
    category: 'POLICY_RESEARCH',
    instructor: 'Dr. Sarah Van Der Berg (Tech & Geopolitics Chair, Oxford)',
    durationHours: 12,
    scheduleDate: '2026-12-04',
    maxParticipants: 20,
    enrolledEmployeeIds: ['emp-7', 'emp-10', 'emp-11', 'emp-14'],
    completedEmployeeIds: [],
    description: 'Leveraging open-source intelligence, satellite imagery analysis, and predictive modeling for policy dialogue.'
  },
  {
    id: 'tr-3',
    title: 'Global Data Protection, Confidentiality & Anti-Espionage Protocols',
    code: 'CISD-TR-03',
    category: 'COMPLIANCE',
    instructor: 'David Kalu (CISD IT Lead) & INTERPOL Guest Lecturers',
    durationHours: 6,
    scheduleDate: '2026-11-18',
    maxParticipants: 30,
    enrolledEmployeeIds: ['emp-3', 'emp-4', 'emp-5', 'emp-8', 'emp-9', 'emp-12', 'emp-15'],
    completedEmployeeIds: ['emp-1', 'emp-2', 'emp-11'],
    description: 'Mandatory annual refresher on sovereign data handling, encryption keys, and defense against state-sponsored spear-phishing.'
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'High-Level Dialogue on Sahel Peace & Security - Abuja Ministerial Summit',
    category: 'DIPLOMATIC_EVENT',
    content: 'The Centre for International Strategic Dialogue will host diplomatic delegations from 14 nations and multilateral bodies at the Transcorp Hilton Abuja on November 18-20, 2026. All staff on the logistical planning committee are requested to attend the operations briefing on Friday.',
    priority: 'HIGH',
    publishDate: '2026-11-04',
    authorId: 'emp-1',
    acknowledgeCount: 14
  },
  {
    id: 'ann-2',
    title: 'Updated CISD Hybrid Work Schedule & End-of-Year Calendar',
    category: 'POLICY',
    content: 'Please ensure all schedule change requests for the upcoming diplomatic summit week are submitted to your line manager by November 10th. Essential dialogue personnel will be required on-site between Nov 17-21.',
    priority: 'NORMAL',
    publishDate: '2026-11-02',
    authorId: 'emp-3',
    acknowledgeCount: 15
  },
  {
    id: 'ann-3',
    title: 'Happy Birthday to Babatunde Fashina!',
    category: 'CELEBRATION',
    content: 'Wishing our Senior Financial Analyst, Babatunde Fashina, a very happy birthday and continued success with CISD!',
    priority: 'NORMAL',
    publishDate: '2026-11-05',
    authorId: 'emp-8',
    acknowledgeCount: 12
  }
];

export const initialTimesheets: Timesheet[] = [
  {
    id: 'ts-1',
    employeeId: 'emp-7',
    weekStartDate: '2026-10-26',
    weekEndDate: '2026-10-30',
    status: 'APPROVED',
    submittedAt: '2026-10-30',
    approvedBy: 'emp-2',
    totalHours: 40,
    entries: [
      { projectId: 'prj-1', projectName: 'Sahel Security Strategic Dialogue', activity: 'Drafting ministerial briefing memos', mon: 5, tue: 6, wed: 5, thu: 6, fri: 4, totalHours: 26 },
      { projectId: 'prj-2', projectName: 'AfCFTA Critical Minerals Consensus', activity: 'Peer reviewing economic models', mon: 3, tue: 2, wed: 3, thu: 2, fri: 4, totalHours: 14 }
    ]
  },
  {
    id: 'ts-2',
    employeeId: 'emp-14',
    weekStartDate: '2026-10-26',
    weekEndDate: '2026-10-30',
    status: 'SUBMITTED',
    submittedAt: '2026-10-30',
    totalHours: 40,
    entries: [
      { projectId: 'prj-3', projectName: 'Energy Transition & Gulf-Africa Dialogue', activity: 'Synthesizing sovereign wealth investment flows', mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, totalHours: 40 }
    ]
  }
];

export const initialSettings: OrganizationSettings = {
  name: 'Centre for International Strategic Dialogue',
  abbreviation: 'CISD',
  headquarters: 'Diplomatic Enclave, Central Business District, Abuja, Federal Capital Territory, Nigeria',
  tagline: 'Bridging Nations Through Impartial Strategic Foresight & High-Level Policy Dialogue',
  email: 'secretariat@cisdialogue.org',
  phone: '+234 9 461 9000',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  officeHours: {
    start: '08:30',
    end: '17:00'
  },
  hybridPolicy: {
    minimumOfficeDays: 3,
    mandatoryOfficeDays: ['Monday', 'Thursday']
  },
  leaveEntitlements: {
    annual: 21,
    sick: 12,
    casual: 5,
    maternity: 90,
    paternity: 14
  },
  fiscalYear: 'January - December'
};

export const initialAuditLogs: SystemAuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-05 08:15:00',
    userId: 'emp-1',
    userName: 'Dr. Amina Bello',
    action: 'CLOCK_IN',
    module: 'Attendance',
    details: 'Biometric clock-in recorded at Abuja HQ (Executive Suite).'
  },
  {
    id: 'log-2',
    timestamp: '2026-11-04 16:30:00',
    userId: 'emp-3',
    userName: 'Olumide Adeyemi',
    action: 'LEAVE_APPROVE',
    module: 'Leave Management',
    details: 'Approved casual leave request for Babatunde Fashina (Nov 12-13).'
  },
  {
    id: 'log-3',
    timestamp: '2026-11-04 14:10:00',
    userId: 'emp-1',
    userName: 'Dr. Amina Bello',
    action: 'ANNOUNCEMENT_CREATE',
    module: 'Announcements',
    details: 'Published official communiqué regarding Abuja Ministerial Summit.'
  }
];
