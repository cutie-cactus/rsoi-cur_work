import Alert from '@mui/material/Alert';

import "./Boards.css";
import { ITicket } from "../../interfaces/Ticket/ITicket";
import { ConfirmationWindow } from "../ModalWindows/ConfirmationWindow";
import { TextRow } from "../Texts/TextRow";
import { RefundIcon } from '../Icons/RefundIcon';
import { useWindow } from "../../hooks/useWindows/useWindow";


interface TicketsItemProps {
	ticket: ITicket
	ticketRefund: (ticketUid: string) => Promise<void>
}

export function TicketsItem({ ticket, ticketRefund }: TicketsItemProps) {	
	const confirmDeleteWindow = useWindow();

	return (
		<>
			<div className="tickets-item"> 
				<div className="tickets-info">

					<div className="flex flex-row w-full items-center">
						<div className="w-full font-bold text-2xl text-slate-900">
							{ `Рейс ${ticket.flightNumber}` }
						</div>

						{ ticket.status === "PAID" &&
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
							text={ `${ticket.price} ` } 
						/>
					</div>
					
					{ ticket.status === "PAID" 
						? <Alert
								sx={{	fontSize: 18 }}
								severity="success"
							>
								{`Оплачен`}
							</Alert>
						: <Alert
								sx={{	fontSize: 18 }}
								severity="warning"
							>
								{`Возвращён`}
							</Alert>
					}
					
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
							text={ `${ticket.price} ` } 
						/>
					</div>

				</ConfirmationWindow>
			}
		</>
	)
}
