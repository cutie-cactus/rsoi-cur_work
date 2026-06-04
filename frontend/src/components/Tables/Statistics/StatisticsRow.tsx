import "../Tables.css";
import { IStatistics } from "../../../interfaces/Statistics/IStatistics";


interface StatisticsRowProps {
	statistics: IStatistics
	addClassName?: string
}

function getStatusClass(statusCode: number | string) {
	const code = Number(statusCode);
	if (code >= 200 && code < 300) return "status-pill status-pill-success";
	if (code >= 300 && code < 400) return "status-pill status-pill-redirect";
	if (code >= 400 && code < 500) return "status-pill status-pill-client";
	return "status-pill status-pill-server";
}

export function StatisticsRow(props: StatisticsRowProps) {
	return (
		<div
			className={ `row ${ props.addClassName }` }
		>
			<div className="row-item basis-1/6">
				<span className="method-pill">{ props.statistics.method }</span>
			</div>
			<div className="row-item basis-1/2">{ props.statistics.url }</div>
			<div className="row-item basis-1/6">
				<span className={ getStatusClass(props.statistics.status_code) }>{ props.statistics.status_code }</span>
			</div>
			<div className="row-item basis-1/4">{ props.statistics.time }</div>
		</div>
	)
}
