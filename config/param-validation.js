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

    // POST /api/timesheets
    createTimesheet: {
        body: {
            pilot: Joi.string().required(),
            isAvailable: Joi.boolean().required()
        }
    },

    // UPDATE /api/timesheets/:timesheetId
    updateTimesheet: {
        body: {
            pilot: Joi.string().required(),
            isAvailable: Joi.boolean().required()
        },
        params: {
            timesheetId: Joi.string().hex().required()
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

    // POST /api/pilots
    createCustomer: {
        body: {
            userId: Joi.string().required()
        }
    },

    // UPDATE /api/pilots/:pilotId
    updateCustomer: {
        body: {},
        params: {
            customerId: Joi.string().hex().required()
        }
    },
  // POST /api/pilots
  createManager: {
    body: {
      userId: Joi.string().required()
    }
  },

  // UPDATE /api/pilots/:pilotId
  updateManager: {
    body: {},
    params: {
      customerId: Joi.string().hex().required()
    }
  },

  // POST /api/pilots
  createFranchise: {
    body: {
      name: Joi.string().required()
    }
  },

  // UPDATE /api/pilots/:pilotId
  updateFranchise: {
    body: {},
    params: {
      franchiseId: Joi.string().hex().required()
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
  // POST /api/orders
  createTarget: {
    body: {
      target: Joi.string().required(),
      date: Joi.string().required()
    }
  },

  // UPDATE /api/orders/:orderId
  updateTarget: {
    body: {},
    params: {
      targetId: Joi.string().hex().required()
    }
  },
  // POST /api/orders
  createAttachment: {
    body: {
      source: Joi.string().required(),
      uploaded: Joi.boolean().required()
    }
  },

  // UPDATE /api/orders/:orderId
  updateAttachment: {
    body: {},
    params: {
      attachmentId: Joi.string().hex().required()
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
