import { IPrivilege } from "../Bonus/IPrivilege"
import { ITicket } from "./ITicket"


export interface ITicketResponse {
	ticketUid: string
	flightNumber: string
	fromAirport: string
	toAirport: string
	date: string
	price: number
	paidByMoney: number
	paidByBonuses: number
	status: string
	privilege: IPrivilege
	quantity?: number
	totalPrice?: number
	tickets?: ITicket[]
};
