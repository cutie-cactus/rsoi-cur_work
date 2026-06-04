import "../Tables.css";
import { FlightsTitleRow } from "./FlightsTitleRow";
import { FlightsRow } from "./FlightsRow";
import { FlightsTableFilter } from "./FlightsTableFilter";
import { TablePagination } from '../TablePagination';
import { DataLoadError } from "../../DataLoadError/DataLoadError";
import { FilterFlightsWindow } from "../../ModalWindows/FilterFlightsWindow";
import { PurchaseInfoWindow } from "../../ModalWindows/PurchaseInfoWindow";
import { ITicketResponse } from "../../../interfaces/Ticket/ITicketResponse";
import { IUser } from '../../../interfaces/User/IUser';
import { IFilterFlight } from "../../../interfaces/Flight/IFilterFlight";
import { usePurchaseInfoWindow } from "../../../hooks/useWindows/usePurchaseInfoWindow";
import { useFlightsTable } from "../../../hooks/useTables/useFlightsTable";
import { useFilterFlightsWindow } from "../../../hooks/useWindows/useFilterFlightsWindow";


interface FlightsTableProps {
	openMiniDrawer: boolean
	user: IUser | null
}

function getFilterSummary(filterTable: IFilterFlight) {
	const summary: string[] = [];
	if (filterTable.flightNumber) summary.push(`рейс: ${filterTable.flightNumber}`);
	if (filterTable.fromAirport) summary.push(`откуда: ${filterTable.fromAirport}`);
	if (filterTable.toAirport) summary.push(`куда: ${filterTable.toAirport}`);
	if (filterTable.minPrice) summary.push(`от ${filterTable.minPrice} ₽`);
	if (filterTable.maxPrice) summary.push(`до ${filterTable.maxPrice} ₽`);
	if (filterTable.minDate) summary.push(`после выбранной даты`);
	if (filterTable.maxDate) summary.push(`до выбранной даты`);
	return summary;
}

export function FlightsTable({ openMiniDrawer, user }: FlightsTableProps) {
	const { 
		privilege,
		flights,
		amountFlights,
		sortTable, 
		filterTable,
		page, 
		rowsPerPage,
		error,
		handleUpdatePrivilege,
		handleUpdateTable,
		handleChangePage, 
		handleChangeRowsPerPage,
		handleChangeSort,
		handleChangeFilter,
	} = useFlightsTable();

	const filterFlightsWindow = useFilterFlightsWindow({ handleChangeFilter });
	const purchaseInfoWindow = usePurchaseInfoWindow();
	const filterSummary = getFilterSummary(filterTable);

	return (
		<>
			<div className={`${openMiniDrawer ? "short-table-container" : "long-table-container"}`}>
				<div className="table flight-table">
					<div className="flight-dashboard-header">
						<div>
							<div className="section-eyebrow">flight marketplace</div>
							<div className="section-title">Подбор авиамаршрута</div>
							<div className="section-subtitle">Откройте фильтры, выберите направление, дату или диапазон стоимости и оформите покупку.</div>
						</div>
						<div className="dashboard-actions">
							{ filterSummary.length > 0 &&
								<div className="filter-summary">
									<span>Активно:</span>
									<span>{ filterSummary.slice(0, 2).join(', ') }{ filterSummary.length > 2 ? '…' : '' }</span>
								</div>
							}
							<FlightsTableFilter
								filterTable={ filterTable }
								handleOpenWindow={ filterFlightsWindow.handleOpenWindow }
								text="Выбрать фильтры"
							/>
							<div className="dashboard-badge">Gateway online</div>
						</div>
					</div>
					<FlightsTitleRow 
						sortTable={ sortTable }
						filterTable={ filterTable }
						handleChangeSort={ handleChangeSort }
						handleOpenFilterWindow={ filterFlightsWindow.handleOpenWindow }
					/>

					<div className="rows-container">
						{ !error
							?	<div className="rows">
									{ flights.map((flight, index) => 
											<FlightsRow 
												key={ flight.flightNumber }
												flight={ flight } 
												user={ user }
												privilege={ privilege }
												handleOpenPurchaseInfoWindow={ purchaseInfoWindow.handleOpenWindow }
												handleUpdatePrivilege={ handleUpdatePrivilege }
												addClassName={index % 2 ? "bg-gray-200": "bg-white"}
											/>
										)
									}
								</div>
							: <DataLoadError 
									handleUpdate={ handleUpdateTable }
								/>
						}
					</div>

					<TablePagination
						amountItems={ amountFlights }
						page={ page }
						handleChangePage={ handleChangePage }
						rowsPerPage={ rowsPerPage }
						handleChangeRowsPerPage={ handleChangeRowsPerPage }
					/>
				</div>
			</div>

			{ filterFlightsWindow.visibility && 
				<FilterFlightsWindow 
					filterTable={ filterTable }
					onFilter={ filterFlightsWindow.handleSearch } 
					onClose={ filterFlightsWindow.handleCloseWindow }
				/> 
			}

			{ purchaseInfoWindow.visibility && 
				<PurchaseInfoWindow 
					ticket={ purchaseInfoWindow.ticket as ITicketResponse }
					onClose={ purchaseInfoWindow.handleCloseWindow }
				/>
			}
		</>
	)
}
