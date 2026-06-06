import "../Tables.css";
import { FlightsTableColumn } from "./FlightsTableColumn";
import { SortFlights } from "../../../enums/SortFlights";
import { IFilterFlight } from "../../../interfaces/Flight/IFilterFlight";


interface FlightsTitleRowProps {
	sortTable: SortFlights,
	filterTable: IFilterFlight,
	handleChangeSort: (sortTable: SortFlights) => void,
	handleOpenFilterWindow: () => void,
}

export function FlightsTitleRow(props: FlightsTitleRowProps) {
	return (
		<div className="title-row">
			<FlightsTableColumn 
				nameColumn='Рейс' 
				sortAsc={ SortFlights.FlightNumberAsc } 
				sortDesc={ SortFlights.FlightNumberDesc }
				sortTable={ props.sortTable }
				handleChangeSort={ props.handleChangeSort }
				addClassName="basis-[13%]"
			/>
			<FlightsTableColumn 
				nameColumn='Откуда' 
				sortAsc={ SortFlights.FromAirportmAsc } 
				sortDesc={ SortFlights.FromAirportDesc }
				sortTable={ props.sortTable }
				handleChangeSort={ props.handleChangeSort }
				addClassName="basis-[20%]"
			/>
			<FlightsTableColumn 
				nameColumn='Куда' 
				sortAsc={ SortFlights.ToAirportmAsc } 
				sortDesc={ SortFlights.ToAirportDesc }
				sortTable={ props.sortTable }
				handleChangeSort={ props.handleChangeSort }
				addClassName="basis-[20%]"
			/>
			<FlightsTableColumn 
				nameColumn='Вылет' 
				sortAsc={ SortFlights.DateAsc } 
				sortDesc={ SortFlights.DateDesc }
				sortTable={ props.sortTable }
				handleChangeSort={ props.handleChangeSort }
				addClassName="basis-[17%]"
			/>
			<FlightsTableColumn 
				nameColumn='Тариф' 
				sortAsc={ SortFlights.PriceAsc } 
				sortDesc={ SortFlights.PriceDesc }
				sortTable={ props.sortTable }
				handleChangeSort={ props.handleChangeSort }
				addClassName="basis-[12%]"
			/>
			<div className="row-item basis-[12%] font-bold">Места</div>

			<div className="actions" />
		</div>
	)
}
