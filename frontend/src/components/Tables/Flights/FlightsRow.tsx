import "../Tables.css";
import { IFlight } from "../../../interfaces/Flight/IFlight";
import { ITicketResponse } from "../../../interfaces/Ticket/ITicketResponse";
import { PayIcon } from "../../Icons/PayIcon";
import { IUser } from '../../../interfaces/User/IUser';
import { IPrivilege } from "../../../interfaces/Bonus/IPrivilege";
import { BuyTicketWindow } from "../../ModalWindows/BuyTicketWindow";
import { useWindow } from "../../../hooks/useWindows/useWindow";


interface FlightsRowProps {
	flight: IFlight
	user: IUser | null
	privilege: IPrivilege | null
	handleOpenPurchaseInfoWindow: (ticket: ITicketResponse) => void
	handleUpdatePrivilege: () => Promise<void>
	addClassName?: string
}

export function FlightsRow(props: FlightsRowProps) {
	const buyTicketWindow = useWindow();
	const availableSeats = props.flight.availableSeats ?? 0;
	const capacity = props.flight.capacity ?? availableSeats;
	const isSoldOut = availableSeats <= 0;

	return (
		<>
			<div
				className={ `row ${ props.addClassName } ${isSoldOut ? "opacity-60" : ""}` }
				onDoubleClick={ props.user && !isSoldOut ? buyTicketWindow.handleOpenWindow : undefined }
			>
				<div className="row-item basis-[13%]">{ `№ ${props.flight.flightNumber}` }</div>
				<div className="row-item basis-[20%]">{ props.flight.fromAirport }</div>
				<div className="row-item basis-[20%]">{ props.flight.toAirport }</div>
				<div className="row-item basis-[17%]">{ props.flight.date }</div>
				<div className="row-item basis-[12%]">{ `${props.flight.price} ₽` }</div>
				<div className="row-item basis-[12%]">
					<span className={isSoldOut ? "text-red-700 font-bold" : "text-emerald-700 font-bold"}>
						{isSoldOut ? "нет мест" : `${availableSeats}/${capacity}`}
					</span>
				</div>
				
				<div className="actions">
					{ props.user && !isSoldOut &&
						<PayIcon 
							color="gray"
							addClassName="px-2 py-2"
							onClick={ buyTicketWindow.handleOpenWindow }
						/>
					}
				</div>
			</div>

			{ buyTicketWindow.visibility &&
				<BuyTicketWindow
					flight={ props.flight }
					privilege={ props.privilege }
					onClose={ buyTicketWindow.handleCloseWindow }
					handleOpenPurchaseInfoWindow={ props.handleOpenPurchaseInfoWindow }
					handleUpdatePrivilege={ props.handleUpdatePrivilege }
				/>
			}
		</>
	)
}
