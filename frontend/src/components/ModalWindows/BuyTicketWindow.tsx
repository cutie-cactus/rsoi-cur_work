import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { useNavigate } from "react-router-dom";

import "./ModalWindows.css";
import GatewayService from '../../services/GatewayService';
import { Backdrop } from "./Backdrop";
import { FormButton } from "../Buttons/FormButton";
import { FormOptionallyButton } from "../Buttons/FormOptionallyButton";
import { TextHeader } from "../Texts/TextHeader";
import { TextField as StaticTextField } from "../Texts/TextField";
import { TextRow } from '../Texts/TextRow';
import { ConfirmationWindow } from "./ConfirmationWindow";
import { ITicketResponse } from '../../interfaces/Ticket/ITicketResponse';
import { IPrivilege } from '../../interfaces/Bonus/IPrivilege';
import { IFlight } from '../../interfaces/Flight/IFlight';
import { useBuyTicketForm } from "../../hooks/useForms/useBuyTicketForm";
import { useWindow } from "../../hooks/useWindows/useWindow";


interface BuyTicketWindowProps {
	flight: IFlight
	privilege: IPrivilege | null
	onClose: () => void
	handleOpenPurchaseInfoWindow: (ticket: ITicketResponse) => void
	handleUpdatePrivilege: () => Promise<void>
}

export function BuyTicketWindow(props: BuyTicketWindowProps) {
	const submitHandler = (event: React.FormEvent) => {
		event.preventDefault();
	};

	const keyDownHandler = (event: React.KeyboardEvent) => {
		if (event.key === "Escape") {
			props.onClose();
		}
	};

	const availableSeats = props.flight.availableSeats ?? 1;
	const maxQuantity = Math.max(1, availableSeats || 1);
	const { 
		paidFromBalance,
		setPaidFromBalance,
		quantity,
		setQuantity,
	} = useBuyTicketForm(maxQuantity);

	const confirmBuyWindow = useWindow();
	const navigate = useNavigate();
	const totalPrice = props.flight.price * quantity;
	const bonusText = props.privilege ? `${props.privilege.balance}` : "0";
	
	return (
		<>
			<Backdrop onClick={ props.onClose }/>

			<div className="add-window">
				<form 
					onSubmit={ submitHandler } 
					onKeyDown={ keyDownHandler }
				>
					<TextHeader text="Покупка билетов"/>

					<Alert
						sx={{	fontSize: 18, borderRadius: 3 }}
						severity="info"
					>
						{`Доступно мест на рейс: ${availableSeats}. На бонусном счёте: ${bonusText}.`}
					</Alert>

					<div className="m-5 grid gap-4">
						<TextField
							label="Количество билетов"
							type="number"
							value={quantity}
							inputProps={{ min: 1, max: availableSeats }}
							onChange={(event) => setQuantity(Number(event.target.value))}
							helperText={`Можно купить от 1 до ${availableSeats} билетов. Каждый билет будет отдельным и будет сдаваться отдельно.`}
							fullWidth
						/>

						<div className="flex flex-row gap-3">
							<FormOptionallyButton
								text="1 билет"
								onClick={() => setQuantity(1)}
							/>
							<FormOptionallyButton
								text="Выкупить все места"
								onClick={() => setQuantity(availableSeats)}
							/>
						</div>

						<div className="flex flex-row justify-center items-center">
							<StaticTextField
								text="Воспользоваться бонусами для оплаты билетов"
								addClassName="w-full"
							/>
							<Switch 
								checked={ paidFromBalance }
								onChange={ () => setPaidFromBalance(!paidFromBalance) }
							/>
						</div>
						<Alert sx={{ fontSize: 16, borderRadius: 3 }} severity="success">
							{`Итоговая стоимость без учёта бонусов: ${totalPrice} ₽ за ${quantity} шт.`}
						</Alert>
					</div>

					<div className="central-buttons">
						<FormButton 
							text="Купить"
							onClick={ confirmBuyWindow.handleOpenWindow }
						/>
						<FormOptionallyButton 
							text="Закрыть"
							onClick={ props.onClose }
						/>
					</div>
				</form>
			</div>

			{ confirmBuyWindow.visibility && 
				<ConfirmationWindow 
					header="Подтвердите покупку"
					children={
						<>
							<div className="mb-5">
								<TextRow
									label="Номер рейса"
									text={ props.flight.flightNumber }
								/>
							</div>
							<div className="mb-5">
								<TextRow
									label="Маршрут"
									text={ `${props.flight.fromAirport} → ${props.flight.toAirport}` }
								/>
							</div>
							<div className="mb-5">
								<TextRow
									label="Дата и время отправления"
									text={ props.flight.date }
								/>
							</div>
							<div className="mb-5">
								<TextRow
									label="Количество"
									text={ `${quantity}` }
								/>
							</div>
							<TextRow
								label="Итого"
								text={ `${totalPrice} ₽` }
							/>
						</>
					}
					onClose={ confirmBuyWindow.handleCloseWindow }
					onConfirm={ async () => {
							const response = await GatewayService.buyTicket(
								{ 
									flightNumber: props.flight.flightNumber,
									price: props.flight.price,
									paidFromBalance,
									quantity,
								}
							);
							if (response) {
								confirmBuyWindow.handleCloseWindow();
								props.onClose();
								props.handleOpenPurchaseInfoWindow(response.data);
								await props.handleUpdatePrivilege();
							} else {
								navigate("/network_error");
							}
						}
					}
				/>
			}
		</>
	)
}
