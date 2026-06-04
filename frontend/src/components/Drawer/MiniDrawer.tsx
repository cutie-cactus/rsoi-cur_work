import * as React from 'react';
import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';

import { DrawerNavBar } from './DrawerNavBar';
import { IUser } from '../../interfaces/User/IUser';


export const drawerWidth = 0;

interface MiniDrawerProps {
	theme: Theme
	open: boolean
	user: IUser | null
	handleDrawerOpen: () => void
	handleDrawerClose: () => void
	changeUser: (user: IUser | null) => void
	children?: React.ReactNode
}

export function MiniDrawer(props: MiniDrawerProps) {
	return (
		<Box sx={{ minHeight: '100vh' }}>
			<DrawerNavBar
				open={ false }
				user={ props.user }
				handleDrawerOpen={ props.handleDrawerOpen }
				handleDrawerClose={ props.handleDrawerClose }
				changeUser={ props.changeUser }
			/>

			<Box component="main" sx={{ flexGrow: 1 }}>
				{ props.children }
			</Box>
		</Box>
	);
}
