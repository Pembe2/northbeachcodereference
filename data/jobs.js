window.CODE_JOBS = [
  {
    id: "install-receptacle",
    name: "Install receptacle",
    aliases: ["install outlet", "install receptacle", "add outlet", "add receptacle", "new outlet", "new receptacle"],
    locations: {
      bathroom: ["bathroom", "bath", "vanity"]
    },
    variants: {
      install: ["install", "add", "new"],
      replace: ["replace", "replacing", "swap", "change"]
    },
    rules: {
      bathroom: {
        always: [
          "elec-gfci-bath",
          "elec-bath-receptacle-location",
          "elec-bath-circuit",
          "elec-tamper-resistant"
        ],
        conditional: {
          replace: ["elec-tamper-resistant"]
        }
      }
    },
    followups: [
      {
        id: "variant",
        question: "Is this a new receptacle or a replacement?",
        options: [
          { value: "install", label: "New receptacle" },
          { value: "replace", label: "Replacement" }
        ]
      },
      {
        id: "circuit",
        question: "Are you extending an existing bathroom circuit or adding a new circuit?",
        options: [
          { value: "existing", label: "Existing circuit" },
          { value: "new", label: "New circuit" },
          { value: "unknown", label: "Not sure" }
        ]
      }
    ]
  }
];
