import { ITicket } from "../interfaces/Ticket/ITicket";

export function parseTripDate(date?: string): Date | null {
  if (!date) return null;
  const normalized = date.includes("T") ? date : date.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isPastTrip(date?: string): boolean {
  const parsed = parseTripDate(date);
  return parsed ? parsed.getTime() < Date.now() : false;
}

export function isArchivedPaidTrip(ticket: ITicket): boolean {
  return ticket.status === "PAID" && isPastTrip(ticket.date);
}

export function getTripState(ticket: ITicket) {
  if (ticket.status === "CANCELED") {
    return {
      className: "ticket-state-refunded",
      label: "Возвращён",
      description: "Покупка отменена, билет перенесён в историю операций.",
      canRefund: false,
    };
  }

  if (isArchivedPaidTrip(ticket)) {
    return {
      className: "ticket-state-archived",
      label: "Совершённая поездка",
      description: "Маршрут завершён — билет хранится в архиве поездок.",
      canRefund: false,
    };
  }

  return {
    className: "ticket-state-active",
    label: "Активный билет",
    description: "Перелёт запланирован, билет доступен для возврата до вылета.",
    canRefund: true,
  };
}
