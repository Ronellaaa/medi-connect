export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  enabled: boolean;
}

export interface Patient extends User {
  dateOfBirth: string;
  gender: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
}

export interface MedicalReport {
  id: number;
  title: string;
  description: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  reportDate: Date;
}

export interface Prescription {
  id: number;
  doctorId: number;
  doctorName: string;
  appointmentId: number;
  diagnosis: string;
  medications: string;
  instructions: string;
  validUntil: Date;
  issuedAt: Date;
}

export interface Appointment {
  id: number;
  doctorId: number;
  doctorName: string;
  patientId: number;
  patientName: string;
  dateTime: Date;
  status: string;
  consultationFee: number;
  paymentStatus: string;
}

export interface PlatformStats {
  totalPatients: number;
  activePatients: number;
  totalDoctors: number;
  activeDoctors: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  platformFees: number;
  patientsByMonth: Record<string, number>;
  appointmentsByStatus: Record<string, number>;
}