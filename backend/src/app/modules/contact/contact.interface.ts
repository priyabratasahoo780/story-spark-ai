export type ContactFeedbackType = "bug" | "feature" | "feedback" | "general";

export type IContactRequest = {
  fullname?: string;
  name?: string;
  email?: string;
  feedbackType?: ContactFeedbackType;
  subject: string;
  message: string;
};
