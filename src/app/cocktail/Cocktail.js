import React, { Fragment, useContext, useEffect, useState } from 'react';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import EmptyView from '../common/EmptyView';
import Header from '../common/Header';
import noCocktailDark from '../../assets/images/no-cocktail-dark.png';
import noCocktailLight from '../../assets/images/no-cocktail-light.png';
import Notification from '../common/Notification';
import { ThemeContext } from '../utils/contexts';
import { THEMES } from '../utils/constants';
import { getGlasswareImage, getMethodImage } from '../utils/service';
import SkeletonCocktail from './SkeletonCocktail';

export default function Cocktail() {
	const classes = cocktailStyles();

	const {theme} = useContext(ThemeContext);

	const [data, setData] = useState({ingredients: []});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [cocktailImage, setCocktailImage] = useState('');
	const [glasswareImage, setGlasswareImage] = useState('');
	const [methodImage, setMethodImage] = useState('');
	const [invert, setInvert] = useState({});

	useEffect(() => {
		const fetchData = async () => {
			const id = window.location.pathname.split('/').pop();

			if (!id) {
				window.location = '/';
			}

			return axios(`${process.env.REACT_APP_URL}/cocktail/${id}`)
				.then(result => {
					result = result.data.message;
					document.title = result.name;
					setData(result);
					setLoading(false);
					result.img_url ? setCocktailImage(result.img_url) : setNoCocktailImage();
					loadImages(result.glassware, result.method);
				})
				.catch(() => {
					setError(true);
					setLoading(false);
				});
		};
		fetchData();
	}, []);

	useEffect(() => {
		cocktailImage.includes('no-cocktail-') && setNoCocktailImage();
		data.glassware && loadImages(data.glassware, data.method);
		setInvert(theme === THEMES.light ? {filter: 'invert(1)'} : {});
	}, [theme]);

	const setNoCocktailImage = () => setCocktailImage(theme === THEMES.light ? noCocktailLight : noCocktailDark);

	const loadImages = (glassware, method) => {
		setGlasswareImage(getGlasswareImage(glassware));
		setMethodImage(getMethodImage(method));
	};

	return (
		<Fragment>
			<Header hasSidebar={false}/>
			{
				(error || (!loading && data.ingredients.length === 0)) &&
				<Fragment>
					<Notification message={'An error occurred while shaking up the ingredients.'}
					              onClose={() => setError(false)}/>
					<EmptyView width={300}
					           heading={'Cocktail not found'}
					           message={'The ingredients seem to be missing'}/>
				</Fragment>
			}
			{
				loading && <SkeletonCocktail/>
			}
			{
				!loading && data.ingredients.length > 0 &&
				<Fragment>
					<Typography variant="h4" className={classes.title}>{data.name}</Typography>

					<Paper elevation={0} className={classes.container}>
						<div className={classes.imageContainer}>
							<img src={cocktailImage} onError={setNoCocktailImage} className={classes.image}/>
						</div>

						<div className={classes.info}>
							<div className={classes.details}>
								<div className={classes.detail}>
									<img height="30"
									     src={methodImage}
									     style={invert}
									     alt={data.method}/>
									<Typography variant="body1">{data.method}</Typography>
								</div>

								<Divider orientation="vertical" flexItem className={classes.detailDivider}/>

								<div className={classes.detail}>
									<img height="30"
									     src={glasswareImage}
									     style={invert}
									     alt={data.glassware}/>
									<Typography variant="body1">{data.glassware}</Typography>
								</div>

								<Divider orientation="vertical" flexItem className={classes.detailDivider}/>

								<div className={classes.detail}>
									<Typography variant="subtitle1" className={classes.subtitle}>
										{data.garnish === 'None' ? 'No garnish' : data.garnish}
									</Typography>
								</div>
							</div>

							<Typography variant="body1" className={classes.preparation}>{data.preparation}</Typography>

							<Table>
								<TableHead>
									<TableRow>
										<TableCell className={classes.tableHead}>Ingredients</TableCell>
										<TableCell className={classes.tableHead} align="right">Amount</TableCell>
									</TableRow>
								</TableHead>

								<TableBody>
									{data.ingredients.map(ingredient => (
										<TableRow key={ingredient.name}>
											<TableCell className={classes.tableCell}>{ingredient.name}</TableCell>
											<TableCell className={classes.tableCell} align="right">
												<Typography color="textSecondary" className={classes.amount}>
													{ingredient.amount}
												</Typography>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</Paper>
				</Fragment>
			}
		</Fragment>
	);
}

const cocktailStyles = makeStyles(theme => ({
	title: {
		textAlign: 'center',
		fontWeight: 'bold',
		padding: theme.spacing(2),
	},
	container: {
		position: 'relative',
		margin: theme.spacing(0, 'auto'),
		width: '100%',
		maxWidth: theme.spacing(62.5),

		[theme.breakpoints.up('sm')]: {
			borderRadius: theme.spacing(2),
			marginBottom: theme.spacing(2),
		},
	},
	imageContainer: {
		display: 'flex',
		flexDirection: 'column',
		verticalAlign: 'middle',
		justifyContent: 'center',
	},
	image: {
		backgroundSize: theme.spacing(62.5),
		margin: 'auto',
		maxWidth: '100%',

		[theme.breakpoints.up('sm')]: {
			borderRadius: theme.spacing(2, 2, 0, 0),
		},
	},
	detailDivider: {
		margin: theme.spacing(1),
	},
	info: {
		display: 'flex',
		flexDirection: 'column',
		verticalAlign: 'middle',
		justifyContent: 'center',
		padding: theme.spacing(2),
	},
	preparation: {
		textAlign: 'justify',
		margin: theme.spacing(2, 1),
	},
	tableHead: {
		fontWeight: 'bold',
		fontSize: '14px',
	},
	tableCell: {
		fontSize: '14px',
		maxWidth: theme.spacing(21.25),
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
	amount: {
		margin: 'auto',
		fontWeight: 'bold',
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
	details: {
		display: 'flex',
		justifyContent: 'space-between',
		textAlign: 'center',
		alignItems: 'center',
		borderRadius: theme.spacing(2),
		backgroundColor: theme.palette.custom.cocktailDetailsBackground,
		padding: theme.spacing(2),
		marginBottom: theme.spacing(2),
	},
	detail: {
		flex: 1,
	},
}));
