import {
  notifyTA,
  notifyTutor,
  notifyUC,
} from "../../app/services/notificationService";

test("notifyTA resolves to undefined", async () => {
  await expect(notifyTA(123)).resolves.toBeUndefined();
});

test("notifyTutor resolves to undefined", async () => {
  await expect(notifyTutor(42, 123, "approved")).resolves.toBeUndefined();
});

test("notifyUC resolves to undefined", async () => {
  await expect(notifyUC(123)).resolves.toBeUndefined();
});
