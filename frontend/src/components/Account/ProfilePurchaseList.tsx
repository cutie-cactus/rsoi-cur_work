import "./Account.css";
import { ITicket } from "../../interfaces/Ticket/ITicket";
import { getTripState } from "../../utils/tripStatus";

interface ProfilePurchaseListProps {
  tickets: ITicket[]
}

export function ProfilePurchaseList({ tickets }: ProfilePurchaseListProps) {
  const sortedTickets = [...tickets].sort((left, right) => {
    const leftDate = new Date(left.date.replace(" ", "T")).getTime() || 0;
    const rightDate = new Date(right.date.replace(" ", "T")).getTime() || 0;
    return rightDate - leftDate;
  });

  return (
    <div className="profile-purchases-list">
      {sortedTickets.length > 0
        ? sortedTickets.map((ticket) => {
          const state = getTripState(ticket);
          return (
            <div className="profile-purchase-card" key={ticket.ticketUid}>
              <div className="profile-purchase-topline">
                <div>
                  <div className="profile-purchase-route">{ticket.fromAirport} → {ticket.toAirport}</div>
                  <div className="profile-purchase-flight">Рейс {ticket.flightNumber}</div>
                </div>
                <span className={`profile-ticket-state ${state.className}`}>{state.label}</span>
              </div>

              <div className="profile-purchase-meta">
                <span>Вылет: {ticket.date || "дата не указана"}</span>
                <span>{ticket.price} ₽</span>
              </div>

              <div className="profile-purchase-note">{state.description}</div>
            </div>
          )
        })
        : <div className="profile-empty-purchases">
            Пока нет покупок. После оформления билета здесь появится маршрутная история.
          </div>
      }
    </div>
  )
}
