import { NavLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import BarChartIcon from '@mui/icons-material/BarChart';

import "./Drawer.css";
import AuthService from '../../services/AuthService';
import { AuthorizeButton } from '../Buttons/AuthorizeButton';
import { RegisterButtom } from '../Buttons/RegisterButtom';
import { IUser } from '../../interfaces/User/IUser';


interface AppBarProps extends MuiAppBarProps {
	open?: boolean;
}

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
	zIndex: theme.zIndex.drawer + 1,
}));

interface DrawerNavBarProps {
	open: boolean
	user: IUser | null
	handleDrawerOpen: () => void
	handleDrawerClose: () => void
	changeUser: (user: IUser | null) => void
}

function topLinkClass({ isActive }: { isActive: boolean }) {
	return isActive ? "top-nav-link top-nav-link-active" : "top-nav-link";
}

export function DrawerNavBar(props: DrawerNavBarProps) {
	return (
		<AppBar position="fixed" open={ false }>
			<Toolbar className="top-toolbar">
				<NavLink to="/" className="aerodesk-brand">
					<span className="brand-mark">✈</span>
					<span>AeroDesk</span>
				</NavLink>

				<nav className="top-nav-menu">
					<NavLink to="/" className={ topLinkClass }>
						<FlightTakeoffIcon fontSize="small" />
						<span>Рейсы</span>
					</NavLink>
					{ props.user &&
						<NavLink to="/tickets" className={ topLinkClass }>
							<AirplaneTicketIcon fontSize="small" />
							<span>Билеты</span>
						</NavLink>
					}
					{ props.user &&
						<NavLink to="/account" className={ topLinkClass }>
							<AccountBoxIcon fontSize="small" />
							<span>Профиль</span>
						</NavLink>
					}
					{ props.user && props.user.role === "ADMIN" &&
						<NavLink to="/statistics" className={ topLinkClass }>
							<BarChartIcon fontSize="small" />
							<span>Статистика</span>
						</NavLink>
					}
				</nav>

				<div className="authorization-block">
					<div className="authorization-button-container">
						{ props.user
							? <AuthorizeButton
									text="Выйти"
									link="/"
									onClick={ () => {
										AuthService.logout();
										props.changeUser(null);
									}}
								/>
							: <AuthorizeButton
									text="Авторизация"
									link="/authorization"
								/>
						}
					</div>

					{ !props.user &&
						<div className="authorization-button-container">
							<RegisterButtom
								text="Регистрация"
								link="/registration"
							/>
						</div>
					}
				</div>
			</Toolbar>
		</AppBar>
	);
}
