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

    humidity: {
      type: "varchar(6)",
      check: "humidity IN ('Úmido', 'Normal', 'Seco')",
      nullable: true,
    },

    temperature: {
      type: "integer",
    },

    light_intensity: {
      type: "varchar(6)",
      check: "light_intensity IN ('Forte', 'Normal', 'Fraca')",
      nullable: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("data");
};
