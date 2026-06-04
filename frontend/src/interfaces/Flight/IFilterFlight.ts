import { Dayjs } from "dayjs"


export interface IFilterFlight {
	flightNumber?: string
	fromAirport?: string
	toAirport?: string
	minDate?: Dayjs | string | null
	maxDate?: Dayjs | string | null
	minPrice?: number
	maxPrice?: number
};
