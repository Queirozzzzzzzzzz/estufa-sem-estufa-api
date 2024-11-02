exports.up = (pgm) => {
  pgm.createTable("data", {
    id: {
      type: "serial",
      primaryKey: true,
    },

    user_id: {
      type: "serial",
      notNull: true,
    },

    viewed: {
      type: "boolean",
      default: false,
    },

    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },

    ph: {
      type: "integer",
    },

    soil_humidity: {
      type: "float",
      nullable: true,
    },

    air_humidity: {
      type: "float",
      nullable: true,
    },

    air_temperature: {
      type: "float",
    },

    light_intensity: {
      type: "float",
      nullable: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("data");
};
