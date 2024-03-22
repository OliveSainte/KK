export function isToday(date: {
  getDate: () => number;
  getMonth: () => number;
  getFullYear: () => number;
}) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
