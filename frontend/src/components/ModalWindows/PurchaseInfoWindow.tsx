import Alert from '@mui/material/Alert';

import "./ModalWindows.css";
import { Backdrop } from "./Backdrop";
import { FormButton } from "../Buttons/FormButton";
import { TextHeader } from "../Texts/TextHeader";
import { ITicketResponse } from "../../interfaces/Ticket/ITicketResponse";


interface PurchaseInfoWindowProps {
	ticket: ITicketResponse
	onClose: () => void
}

export function PurchaseInfoWindow({ ticket, onClose }: PurchaseInfoWindowProps) {
	const quantity = ticket.quantity ?? ticket.tickets?.length ?? 1;
	const totalPrice = ticket.totalPrice ?? ticket.price * quantity;
	const ticketList = ticket.tickets ?? [];

	return (
		<>
			<Backdrop onClick={ onClose }/>

			<div className="info-window">
				<TextHeader text={ quantity > 1 ? "Информация по покупке" : "Информация по билету" }/>

				<Alert
					sx={{ fontSize: 18, borderRadius: 3 }}
					severity="success"
				>
					{`Вы купили ${quantity} билет(а) на рейс ${ticket.flightNumber} по направлению ${ticket.fromAirport} — ${ticket.toAirport}, вылет запланирован на ${ticket.date}. Сумма заказа: ${totalPrice} ₽. Вам доступно ${ticket.privilege.balance} бонусов. Каждый билет создан отдельно и может быть сдан отдельно.`}
				</Alert>

				{ ticketList.length > 1 &&
					<div className="purchase-ticket-list">
						{ticketList.map((item, index) =>
							<div className="purchase-ticket-chip" key={item.ticketUid}>
								<span>Билет {index + 1}</span>
								<span>{item.price} ₽</span>
							</div>
						)}
					</div>
				}

				<div className="right-buttons">
					<FormButton 
						text="Ок"
						onClick={ onClose }
					/>
				</div>
			</div>
		</>
	)
}
