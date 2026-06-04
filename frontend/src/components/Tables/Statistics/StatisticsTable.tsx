import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

import "../Tables.css";
import { StatisticsTitleRow } from "./StatisticsTitleRow";
import { StatisticsRow } from "./StatisticsRow";
import { TablePagination } from '../TablePagination';
import { DataLoadError } from "../../DataLoadError/DataLoadError";
import { useStatisticsTable } from "../../../hooks/useTables/useStatisticsTable";


const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 18,
  fontWeight: 800,
}));

function PieCenterLabel({ children }: { children: React.ReactNode }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

function sum(values: number[]) {
	return values.reduce((acc, value) => acc + value, 0);
}

export function StatisticsTable() {
	const { 
		statistics,
		statusCodeChart,
		methodChart,
		endpointChart,
		amountStatistics,
		page, 
		rowsPerPage,
		error,
		handleUpdateTable,
		handleChangePage, 
		handleChangeRowsPerPage,
	} = useStatisticsTable();

	const status200 = statusCodeChart?.x200 ?? 0;
	const status300 = statusCodeChart?.x300 ?? 0;
	const status400 = statusCodeChart?.x400 ?? 0;
	const status500 = statusCodeChart?.x500 ?? 0;
	const totalOnPage = sum([status200, status300, status400, status500]);

	const methodData = [
		{ value: methodChart?.GET ?? 0, label: 'GET' },
		{ value: methodChart?.POST ?? 0, label: 'POST' },
		{ value: methodChart?.PUT ?? 0, label: 'PUT' },
		{ value: methodChart?.DELETE ?? 0, label: 'DELETE' },
		{ value: methodChart?.PATCH ?? 0, label: 'PATCH' },
		{ value: methodChart?.OPTIONS ?? 0, label: 'OPTIONS' },
		{ value: methodChart?.HEAD ?? 0, label: 'HEAD' },
		{ value: methodChart?.TRACE ?? 0, label: 'TRACE' },
		{ value: methodChart?.CONNECT ?? 0, label: 'CONNECT' },
	].filter(item => item.value > 0);

	const successPercent = totalOnPage ? Math.round((status200 / totalOnPage) * 100) : 0;
	const errorCount = status400 + status500;
	const latestRequest = statistics[0]?.time ?? "—";

	return (
		<div className="statistics-layout">
			<div className="statistics-dashboard">
				<div className="statistics-hero">
					<div>
						<div className="section-eyebrow">traffic monitor</div>
						<div className="statistics-hero-title">Статистика запросов</div>
						<div className="statistics-hero-subtitle">Сначала сводные диаграммы, ниже — пролистываемый журнал HTTP-запросов.</div>
					</div>
					<div className="statistics-hero-badge">Live dashboard</div>
				</div>

				<div className="statistics-kpi-grid">
					<div className="kpi-card">
						<div className="kpi-label">Всего записей</div>
						<div className="kpi-value">{ amountStatistics }</div>
						<div className="kpi-hint">в журнале статистики</div>
					</div>
					<div className="kpi-card">
						<div className="kpi-label">Успешность</div>
						<div className="kpi-value">{ successPercent }%</div>
						<div className="kpi-hint">2xx на текущей странице</div>
					</div>
					<div className="kpi-card">
						<div className="kpi-label">Ошибки</div>
						<div className="kpi-value">{ errorCount }</div>
						<div className="kpi-hint">4xx и 5xx</div>
					</div>
					<div className="kpi-card">
						<div className="kpi-label">Последний запрос</div>
						<div className="kpi-value">{ latestRequest === "—" ? "—" : "now" }</div>
						<div className="kpi-hint">{ latestRequest }</div>
					</div>
				</div>

				<div className="statistics-charts-grid">
					<div className="chart-card chart-card-wide">
						<div className="chart-title">Коды ответа</div>
						<div className="chart-subtitle">Столбчатая диаграмма распределения HTTP-статусов.</div>
						<BarChart
							xAxis={[{ scaleType: 'band', data: ['2xx', '3xx', '4xx', '5xx'] }]}
							series={[{ data: [status200, status300, status400, status500], label: 'Количество' }]}
							width={520}
							height={250}
						/>
					</div>

					<div className="chart-card">
						<div className="chart-title">Методы</div>
						<div className="chart-subtitle">Круговая диаграмма по типам HTTP-операций.</div>
						<PieChart
							series={[{ data: methodData.length ? methodData : [{ value: 1, label: 'Нет данных' }], innerRadius: 72 }]}
							width={340}
							height={250}
						>
							<PieCenterLabel>Methods</PieCenterLabel>
						</PieChart>
					</div>

					<div className="chart-card">
						<div className="chart-title">Популярные endpoints</div>
						<div className="chart-subtitle">Куда чаще всего обращался gateway.</div>
						<div className="endpoint-list">
							{ endpointChart.length
								? endpointChart.map(item => (
									<div className="endpoint-pill" key={ item.url } title={ item.url }>
										<span className="endpoint-url">{ item.url }</span>
										<span className="endpoint-count">{ item.count }</span>
									</div>
								))
								: <div className="endpoint-pill"><span>Нет данных</span><span className="endpoint-count">0</span></div>
							}
						</div>
					</div>
				</div>

				<div className="statistics-list-card">
					<div className="statistics-list-header">
						<div>
							<div className="statistics-list-title">Журнал запросов</div>
							<div className="chart-subtitle">Можно пролистывать список и менять количество строк на странице.</div>
						</div>
					</div>

					<div className="table statistics-table-modern">
						<StatisticsTitleRow />

						<div className="rows-container">
							{ !error
								?	<div className="rows">
										{ statistics.map((item, index) => 
												<StatisticsRow 
													key={ item.id }
													statistics={ item } 
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
							amountItems={ amountStatistics }
							page={ page }
							handleChangePage={ handleChangePage }
							rowsPerPage={ rowsPerPage }
							handleChangeRowsPerPage={ handleChangeRowsPerPage }
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
