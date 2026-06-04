import "../Tables.css";
import { FlightsTableColumn } from "./FlightsTableColumn";
import { SortFlights } from "../../../enums/SortFlights";
import { FlightsTableFilter } from "./FlightsTableFilter";
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
				addClassName="basis-1/6"
			/>
			<FlightsTableColumn 
				nameColumn='Откуда' 
				sortAsc={ SortFlights.FromAirportmAsc } 
				sortDesc={ SortFlights.FromAirportDesc }
				sortTable={ props.sortTable }
				handleChangeSort={ props.handleChangeSort }
				addClassName="basis-1/4"
			/>
			<FlightsTableColumn 
				nameColumn='Куда' 
				sortAsc={ SortFlights.ToAirportmAsc } 
				sortDesc={ SortFlights.ToAirportDesc }
				sortTable={ props.sortTable }
				handleChangeSort={ props.handleChangeSort }
				addClassName="basis-1/4"
			/>
			<FlightsTableColumn 
				nameColumn='Вылет' 
				sortAsc={ SortFlights.DateAsc } 
				sortDesc={ SortFlights.DateDesc }
				sortTable={ props.sortTable }
				handleChangeSort={ props.handleChangeSort }
				addClassName="basis-1/5"
			/>
			<FlightsTableColumn 
				nameColumn='Тариф' 
				sortAsc={ SortFlights.PriceAsc } 
				sortDesc={ SortFlights.PriceDesc }
				sortTable={ props.sortTable }
				handleChangeSort={ props.handleChangeSort }
				addClassName="basis-1/6"
			/>

			<div className="actions">
				<FlightsTableFilter
					filterTable={ props.filterTable }
					handleOpenWindow={ props.handleOpenFilterWindow }
				/>
			</div>
		</div>
	)
}
