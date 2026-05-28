import { z } from "zod";

const feedbackTypes = ["bug", "feature", "feedback", "general"] as const;

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}, z.string().min(1));

const optionalEmailString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}, z.string().email("Invalid email address").optional());

const requiredTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
}, z.string().min(1, "This field is required"));

const contactValidationSchema = z.object({
  body: z.object({
    fullname: optionalTrimmedString.optional(),
    name: optionalTrimmedString.optional(),
    email: optionalEmailString,
    feedbackType: z.enum(feedbackTypes).optional(),
    subject: requiredTrimmedString,
    message: requiredTrimmedString,
  }),
});

export const ContactValidation = {
  contactValidationSchema,
};
