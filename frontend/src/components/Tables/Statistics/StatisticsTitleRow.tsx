import "../Tables.css";


export function StatisticsTitleRow() {
	return (
		<div 
			className="title-row-without-buttons"
		>
			<div className="title-row-item basis-1/6">{ "Метод" }</div>
			<div className="title-row-item basis-1/2">{ "Endpoint" }</div>
			<div className="title-row-item basis-1/6">{ "Код" }</div>
			<div className="title-row-item basis-1/4">{ "Timestamp" }</div>
		</div>
	)
}
