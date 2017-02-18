'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  // POST /api/users
  createUser: {
    body: {
      username: _joi2.default.string().required(),
      mobileNumber: _joi2.default.string().regex(/^[1-9][0-9]{9}$/).required()
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: _joi2.default.string().required(),
      mobileNumber: _joi2.default.string().regex(/^[1-9][0-9]{9}$/).required()
    },
    params: {
      userId: _joi2.default.string().hex().required()
    }
  },

  // POST /api/timesheets
  createTimesheet: {
    body: {
      pilot: _joi2.default.string().required(),
      isAvailable: _joi2.default.boolean().required()
    }
  },

  // UPDATE /api/timesheets/:timesheetId
  updateTimesheet: {
    body: {
      pilot: _joi2.default.string().required(),
      isAvailable: _joi2.default.boolean().required()
    },
    params: {
      timesheetId: _joi2.default.string().hex().required()
    }
  },

  // POST /api/teams
  createTeam: {
    body: {
      name: _joi2.default.string().required()
    }
  },

  // UPDATE /api/teams/:teamId
  updateTeam: {
    body: {
      name: _joi2.default.string().required()
    },
    params: {
      teamId: _joi2.default.string().hex().required()
    }
  },

  // POST /api/pilots
  createPilot: {
    body: {
      userId: _joi2.default.string().required()
    }
  },

  // UPDATE /api/pilots/:pilotId
  updatePilot: {
    body: {},
    params: {
      pilotId: _joi2.default.string().hex().required()
    }
  },

  // POST /api/pilots
  createCustomer: {
    body: {
      userId: _joi2.default.string().required()
    }
  },

  // UPDATE /api/pilots/:pilotId
  updateCustomer: {
    body: {},
    params: {
      customerId: _joi2.default.string().hex().required()
    }
  },
  // POST /api/pilots
  createManager: {
    body: {
      userId: _joi2.default.string().required()
    }
  },

  // UPDATE /api/pilots/:pilotId
  updateManager: {
    body: {},
    params: {
      customerId: _joi2.default.string().hex().required()
    }
  },

  // POST /api/pilots
  createFranchise: {
    body: {
      name: _joi2.default.string().required()
    }
  },

  // UPDATE /api/pilots/:pilotId
  updateFranchise: {
    body: {},
    params: {
      franchiseId: _joi2.default.string().hex().required()
    }
  },

  // POST /api/orders
  createOrder: {
    body: {
      title: _joi2.default.string().required()
    }
  },

  // UPDATE /api/orders/:orderId
  updateOrder: {
    body: {},
    params: {
      orderId: _joi2.default.string().hex().required()
    }
  },
  // POST /api/orders
  createTarget: {
    body: {
      target: _joi2.default.string().required(),
      date: _joi2.default.string().required()
    }
  },

  // UPDATE /api/orders/:orderId
  updateTarget: {
    body: {},
    params: {
      targetId: _joi2.default.string().hex().required()
    }
  },
  // POST /api/auth/login
  login: {
    body: {
      username: _joi2.default.string().required(),
      password: _joi2.default.string().required()
    }
  }
};
module.exports = exports['default'];
//# sourceMappingURL=param-validation.js.map
