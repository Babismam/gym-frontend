import api from "../config/api";

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getAllMembers = async () => {
  const response = await api.get("/members");
  return response.data;
};
export const createMember = async (memberData) => {
  const response = await api.post("/members", memberData);
  return response.data;
};
export const updateMember = async (id, memberData) => {
  const response = await api.put(`/members/${id}`, memberData);
  return response.data;
};
export const deleteMember = async (id) => {
  const response = await api.delete(`/members/${id}`);
  return response.data;
};
export const getMyAttendance = async (memberId) => {
  const response = await api.get(`/members/${memberId}/attendance`);
  return response.data;
};
export const getMyPrograms = async (memberId) => {
  const response = await api.get(`/members/${memberId}/programs`);
  return response.data;
};

export const getMemberDetails = async (id) => {
  const response = await api.get(`/members/${id}`);
  return response.data;
};

export const changeMembership = async (id, membershipData) => {
  const response = await api.put(`/members/${id}/membership`, membershipData);
  return response.data;
};

export const pauseMembership = async (id, days) => {
  const response = await api.put(`/members/${id}/pause-membership`, { days });
  return response.data;
};

export const resumeMembership = async (id) => {
  const response = await api.put(`/members/${id}/resume-membership`);
  return response.data;
};

export const deleteAccount = async (id) => {
  const response = await api.delete(`/members/${id}/account`);
  return response.data;
};

export const getAllTrainers = async (includeInactive = false) => {
  const url = includeInactive ? "/trainers?includeInactive=true" : "/trainers";
  const response = await api.get(url);
  return response.data;
};

export const getTrainerDetails = async (id) => {
  const response = await api.get(`/trainers/${id}`);
  return response.data;
};

export const createTrainer = async (trainerData) => {
  const response = await api.post("/trainers", trainerData);
  return response.data;
};
export const updateTrainer = async (id, trainerData) => {
  const response = await api.put(`/trainers/${id}`, trainerData);
  return response.data;
};
export const deleteTrainer = async (id) => {
  const response = await api.delete(`/trainers/${id}`);
  return response.data;
};
export const getTrainerSchedule = async (trainerId) => {
  const response = await api.get(`/trainers/${trainerId}/schedule`);
  return response.data;
};
export const getTrainerAssignedPrograms = async (trainerId) => {
  const response = await api.get(`/trainers/${trainerId}/programs`);
  return response.data;
};

export const getAllPrograms = async () => {
  const response = await api.get("/programs");
  return response.data;
};
export const createProgram = async (programData) => {
  const response = await api.post("/programs", programData);
  return response.data;
};
export const updateProgram = async (id, programData) => {
  const response = await api.put(`/programs/${id}`, programData);
  return response.data;
};
export const deleteProgram = async (id) => {
  const response = await api.delete(`/programs/${id}`);
  return response.data;
};

export const getFullSchedule = async () => {
  const response = await api.get("/schedule");
  return response.data;
};
export const getAttendeesForSchedule = async (scheduleId) => {
  const response = await api.get(`/schedule/${scheduleId}/attendees`);
  return response.data;
};
export const createSchedule = async (scheduleData) => {
  const response = await api.post('/schedule', scheduleData);
  return response.data;
};
export const updateSchedule = async (id, scheduleData) => {
  const response = await api.put(`/schedule/${id}`, scheduleData);
  return response.data;
};
export const deleteSchedule = async (id) => {
  const response = await api.delete(`/schedule/${id}`);
  return response.data;
};
export const bookClass = async (memberId, scheduleId) => {
  const response = await api.post('/attendance', { memberId, scheduleId });
  return response.data;
};
export const cancelClass = async (memberId, scheduleId) => {
  try {
    const response = await api.delete('/attendance', { data: { memberId, scheduleId } });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Η ακύρωση της κράτησης απέτυχε.";
    throw new Error(message);
  }
};

export const getOpeningHours = async () => {
  const response = await api.get("/opening-hours");
  return response.data;
};

export const removeAttendeeFromSchedule = async (scheduleId, memberId) => {
  const response = await api.delete(`/attendance/${scheduleId}/attendees/${memberId}`);
  return response.data;
};