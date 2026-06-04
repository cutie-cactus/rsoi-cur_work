import Alert from '@mui/material/Alert';

import "./Boards.css";
import { TicketsItem } from "./TicketsItem";
import { DataLoadError } from "../DataLoadError/DataLoadError";
import { IUser } from '../../interfaces/User/IUser';
import { useTicketsBoard } from "../../hooks/useBoard/useTicketsBoard";


interface TicketsBoardProps {
	openMiniDrawer: boolean
	user: IUser
}

export function TicketsBoard({ openMiniDrawer, user }: TicketsBoardProps) {
	const { 
		userInfo,
		error,
		handleUpdateTable,
		ticketRefund,
	} = useTicketsBoard();
	const tickets = [...(userInfo?.tickets ?? [])].sort((left, right) => {
		const leftDate = new Date(left.date.replace(" ", "T")).getTime() || 0;
		const rightDate = new Date(right.date.replace(" ", "T")).getTime() || 0;
		return rightDate - leftDate;
	});

	return (
		<>
			<div className={`${openMiniDrawer ? "short-board-container" : "long-board-container"}`}>
				<div className="board-hero">
					<div>
						<div className="board-hero-title">Личный маршрутный центр</div>
						<div className="board-hero-subtitle">Ваши активные, возвращённые и архивные билеты собраны в виде карточек.</div>
					</div>
					<div className="board-hero-chip">Tickets</div>
				</div>
				{ userInfo &&
					<Alert
						sx={{	fontSize: 18 }}
						severity="info"
					>
						{`${user.firstname}, на Вашем счету ${userInfo.privilege.balance} бонусов`}
					</Alert>
				}
				<div className="board">
					{ !error
						?	<div className="tickets-list">
								{ tickets.map(ticket => 
										<TicketsItem 
											ticket={ ticket }
											ticketRefund={ ticketRefund }
											key={ ticket.ticketUid } 
										/>
									)
								}
							</div>
						: <DataLoadError 
								handleUpdate={ handleUpdateTable }
							/>
					}
				</div>
			</div>
		</>
	)
}
