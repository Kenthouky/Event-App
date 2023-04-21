import { eventRepository } from '../repository/event.js';
import { preparePagination, getTotalPages } from '../utils/pagination.js';

const createEvent = async (req, res) => {
	try {
		const {
			title,
			description,
			category,
			venue,
			locationPoint,
			startDate,
			endDate,
			imageUrl
		} = req.body;
		const event = await eventRepository.createAndSave({
			title: title.toLowerCase(),
			description,
			category: category.toLowerCase(),
			venue,
			locationPoint,
			startDate,
			endDate,
			imageUrl,
			userId: req.validatedToken.userId,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});

		if (event) {
			return res.status(201).send({
				error: false,
				message: 'Event successfully created',
				data: event
			});
		}
	} catch (error) {
		return res.status(500).send({
			error: true,
			message: `Server error, please try again later. ${error}`,
		});
	}
};

const getAllEvents = async (req, res) => {
	try {
		const { page, limit } = req.query;

		const { page: offset, limit: count } = preparePagination(page, limit);

		const allEvents = await eventRepository
			.search()
			.sortDescending('createdAt')
			.return.page(offset, count);

		const totalEvents = await eventRepository.search().return.count();

		const totalPages = getTotalPages(totalEvents, count);

		return res.status(200).send({
			error: false,
			message: 'Events retrieved successfully',
			data: {
				allEvents,
				totalEvents,
				totalPages
			},
		});
	} catch (error) {
		return res.status(500).send({
			error: true,
			message: `Server error, please try again later. ${error}`
		});
	}
};

const getEventById = async (req, res) => {
	try {
		const { eventId } = req.params;

		const event = await eventRepository.fetch(eventId);

		if(!event) {
			return res.status(404).send({
				error: true,
				message: 'Event not found.',
				data: event
			});
		}

		return res.status(200).send({
			error: false,
			message: 'Event retrieved successfully',
			data: event
		});
	} catch (error) {
		return res.status(500).send({
			error: true,
			message: `Server error, please try again later. ${error}`
		});
	}
};

const getEventsByUserId = async (req, res) => {
	try {
		const { userId } = req.validatedToken;
		const { page, limit } = req.query;

		const { page: offset, limit: count } = preparePagination(page, limit);

		const userEvents = await eventRepository
			.search()
			.where('userId')
			.equal(userId)
			.sortDescending('createdAt')
			.return.page(offset, count);

		const totalEvents = await eventRepository
			.search()
			.where('userId')
			.equal(userId)
			.return.count();

		const totalPages = getTotalPages(totalEvents, count);

		return res.status(200).send({
			error: false,
			message: 'Events retrieved successfully',
			data: {
				userEvents,
				totalEvents,
				totalPages
			},
		});
	} catch (error) {
		return res.status(500).send({
			error: true,
			message: `Server error, please try again later. ${error}`,
		});
	}
};

const getEventsNearMe = async (req, res) => {
	try {
		const lon = Number(req.query.lon);
		const lat = Number(req.query.lat);
		const distanceInKm = Number(req.query.distanceInKm) ?? 10;

		const { page, limit } = req.query;

		const { page: offset, limit: count } = preparePagination(pagge, limit);

		const eventsNearMe = await eventRepository
			.search()
			.where('locationPoint')
			.inRadius(
				(circle) => circle.origin(lon, lat).radius(Number(distanceInKm)).km
				)
			.return.count();

		const totalPages = getTotalPages(totalEvents, count);

		return res.status(200).send({
			error: false,
			message: 'Here are the events happening near you.',
			data: {
				eventsNearMe,
				totalEvents,
				totalPages
			},
		});
	} catch (error) {
		return res.status(500).send({
			error: true,
			message: `Server error, please try again later. ${error}`,
		});
	}
};

const  searchEvents = async (req, res) => {
	try {
		const searchKey = Object.keys(req.query)[0];
		const searchValue = Object.values(req.query) [0];

		const { page, limit } = req.query;

		const { page: offset, limit: count } = preparePagination(page, limit);

		if (!searchKey) {
			return await getAllEvents(req, res);
		}

		let searchResult;
		if (searchey && searchkey.toLowerCase() === 'category') {
			searchResult = await searchBytitle(searchValue.toLowerCase(), offset, count);
		}

		return res.status(200).send({
			error: false,
			message: 'Events based on your search criteria.',
			data: searchResult
		});
	} catch (error) {
		return res.status(500).send({
			error: true,
			message: `Server error, please try again later. ${error}`,
		});
	}
};

const searchBycategory = async (category, offset, count) => {
	const events = await eventRepository
		.search()
		.where('category')
		.eq(category)
		.sortDescending('createdAt')
		.return.page(offset, count);

	const totalEvents = await eventRepository
		.search()
		.where('category')
		.eq(category)
		.return.count();
	const totalPages = getTotalPages(totalEvents, count);

	return {
		events,
		totalEvents,
		totalPages
	};
};

const searchBytitle = async (title, offset, count) => {
	const events = await eventRepository
		.search()
		.where('title')
		.match(title)
		.sortDescending('createdAt')
		.return.page(offset, count);
	const totalEvents = await eventRepository
		.search()
		.where('title')
		.match(title)
		.return.count();
	const totalPages = getTotalPages(totalEvents, count);

	return {
		events,
		totalEvents,
		totalPages
	};
};

export {
	createEvent,
	getAllEvents,
	getEventById,
	getEventsByUserId,
	getEventsNearMe,
	searchEvents
};