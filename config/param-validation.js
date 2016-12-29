import Joi from 'joi';

export default {
  // POST /api/users
  createUser: {
    body: {
      username: Joi.string().required(),
      mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/).required()
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string().required(),
      mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/).required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // POST /api/teams
  createTeam: {
    body: {
      name: Joi.string().required()
    }
  },

  // UPDATE /api/teams/:teamId
  updateTeam: {
    body: {
      name: Joi.string().required()
    },
    params: {
      teamId: Joi.string().hex().required()
    }
  },

  // POST /api/pilots
  createPilot: {
    body: {
      userId: Joi.string().required()
    }
  },

  // UPDATE /api/pilots/:pilotId
  updatePilot: {
    body: {},
    params: {
      pilotId: Joi.string().hex().required()
    }
  },

  // POST /api/orders
  createOrder: {
    body: {
      title: Joi.string().required()
    }
  },

  // UPDATE /api/orders/:orderId
  updateOrder: {
    body: {},
    params: {
      orderId: Joi.string().hex().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  }
};
