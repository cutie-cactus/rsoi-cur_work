import "../Tables.css";
import TuneIcon from '@mui/icons-material/Tune';
import { IFilterFlight } from "../../../interfaces/Flight/IFilterFlight";
import { useFilterFlightsIcon } from "../../../hooks/useIcons/useFilterFlightsIcon";


interface FlightsTableFilterProps {
	filterTable: IFilterFlight
	handleOpenWindow: () => void
	text?: string
}

export function FlightsTableFilter({ filterTable, handleOpenWindow, text = "Фильтры" }: FlightsTableFilterProps) {
	const { active } = useFilterFlightsIcon({ filterTable });

	return (
		<button
			type="button"
			className={`flight-filter-button ${active ? "flight-filter-button-active" : ""}`}
			onClick={ handleOpenWindow }
		>
			<TuneIcon fontSize="small" />
			<span>{ active ? "Фильтры включены" : text }</span>
		</button>
	)
}
