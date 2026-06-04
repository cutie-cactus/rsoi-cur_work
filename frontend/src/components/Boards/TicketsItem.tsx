import Alert from '@mui/material/Alert';

import "./Boards.css";
import { ITicket } from "../../interfaces/Ticket/ITicket";
import { ConfirmationWindow } from "../ModalWindows/ConfirmationWindow";
import { TextRow } from "../Texts/TextRow";
import { RefundIcon } from '../Icons/RefundIcon';
import { useWindow } from "../../hooks/useWindows/useWindow";
import { getTripState } from '../../utils/tripStatus';


interface TicketsItemProps {
	ticket: ITicket
	ticketRefund: (ticketUid: string) => Promise<void>
}

export function TicketsItem({ ticket, ticketRefund }: TicketsItemProps) {	
	const confirmDeleteWindow = useWindow();
	const tripState = getTripState(ticket);
	const alertSeverity = ticket.status === "CANCELED" ? "warning" : tripState.className === "ticket-state-archived" ? "info" : "success";

	return (
		<>
			<div className={`tickets-item ${tripState.className}`}> 
				<div className="tickets-info">

					<div className="flex flex-row w-full items-start gap-3">
						<div className="w-full">
							<div className="font-bold text-2xl text-slate-900">
								{ `Рейс ${ticket.flightNumber}` }
							</div>
							<div className="ticket-state-caption">{tripState.label}</div>
						</div>

						{ tripState.canRefund &&
							<RefundIcon 
								color="gray"
								addClassName="px-2 py-2 hover:bg-gray-900/10"
								onClick={ confirmDeleteWindow.handleOpenWindow }
							/>
						}
					</div>

					<div className="mt-3">
						<TextRow 
							label="Откуда"
							text={ `${ticket.fromAirport} ` } 
						/>
					</div>

					<div className="mt-3">
						<TextRow 
							label="Куда"
							text={ `${ticket.toAirport} ` } 
						/>
					</div>

					<div className="mt-3">
						<TextRow 
							label="Вылет"
							text={ `${ticket.date} ` } 
						/>
					</div>

					<div className="my-3">
						<TextRow 
							label="Тариф"
							text={ `${ticket.price} ₽` } 
						/>
					</div>
					
					<Alert sx={{ fontSize: 18, borderRadius: 3 }} severity={alertSeverity}>
						{tripState.description}
					</Alert>
					
				</div>
			</div>

			{ confirmDeleteWindow.visibility && 
				<ConfirmationWindow 
					header="Возврат билета"
					onClose={ confirmDeleteWindow.handleCloseWindow }
					onConfirm={ async () => {
							await ticketRefund(ticket.ticketUid);
							confirmDeleteWindow.handleCloseWindow();
						}
					}
				>
					<TextRow 
						label="Рейс"
						text={ `${ticket.flightNumber} ` } 
					/>

					<div className="mt-5">
						<TextRow 
							label="Откуда"
							text={ `${ticket.fromAirport} ` } 
						/>
					</div>

					<div className="mt-5">
						<TextRow 
							label="Куда"
							text={ `${ticket.toAirport} ` } 
						/>
					</div>

					<div className="mt-5">
						<TextRow 
							label="Вылет"
							text={ `${ticket.date} ` } 
						/>
					</div>

					<div className="mt-5">
						<TextRow 
							label="Тариф"
							text={ `${ticket.price} ₽` } 
						/>
					</div>

				</ConfirmationWindow>
			}
		</>
	)
}
