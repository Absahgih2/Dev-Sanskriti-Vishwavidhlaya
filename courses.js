const courseCategories = {
  1: 'ug', 2: 'ug', 3: 'ug', 4: 'ug', 5: 'ug', 6: 'ug', 7: 'ug', 8: 'ug', 9: 'ug', 10: 'ug',
  11: 'diploma', 12: 'diploma', 13: 'ug', 14: 'cert', 15: 'cert', 16: 'cert', 17: 'diploma', 18: 'diploma',
  19: 'pg', 20: 'pg', 21: 'pg', 22: 'pg', 23: 'pg', 24: 'pg', 25: 'pg', 26: 'pg', 27: 'diploma', 28: 'pg',
  29: 'phd'
};

const courses = [
  {
    id: 1,
    name: "Bachelor of Science (B.Sc.) Yoga",
    code: "B.Sc. (Yoga)-03",
    duration: "6 - Semester's",
    icon: "fa-seedling",
    subcourses: [
      {
        name: "Yoga",
        code: "B.Sc. Yoga 03",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Bachelor of Science (B.Sc.)",
    code: "B.Sc. - 07",
    duration: "6 - Semester's",
    icon: "fa-flask",
    subcourses: [
      {
        name: "I.T.",
        code: "B.Sc. - 07",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 }
        ]
      },
      {
        name: "C.S.",
        code: "B.Sc. - 07",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 }
        ]
      },
      {
        name: "P.C.B.",
        code: "B.Sc. - 07",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 }
        ]
      },
      {
        name: "P.C.M.",
        code: "B.Sc. - 07",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 }
        ]
      },
      {
        name: "Microbiology",
        code: "bsc-07",
        semesters: [
          { name: "Semester - 1", fee: 0.00 },
          { name: "Semester - 2", fee: 0.00 },
          { name: "Semester - 3", fee: 0.00 },
          { name: "Semester - 4", fee: 0.00 },
          { name: "Semester - 5", fee: 0.00 },
          { name: "Semester - 6", fee: 0.00 }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Bachelor of Science (B.Sc.)",
    code: "B.Sc. - 05",
    duration: "6 - Semester's",
    icon: "fa-apple-whole",
    subcourses: [
      {
        name: "Food Nutrition And Dietetics",
        code: "B.Sc. - 05",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Bachelor of Arts (B.A.)",
    code: "B.A. - 09",
    duration: "6 - Semester's",
    icon: "fa-book-open",
    subcourses: [
      {
        name: "B.A.",
        code: "B.A. - 09",
        semesters: [
          { name: "Semester - 1", fee: 8000.00 },
          { name: "Semester - 2", fee: 8000.00 },
          { name: "Semester - 3", fee: 8000.00 },
          { name: "Semester - 4", fee: 8000.00 },
          { name: "Semester - 5", fee: 8000.00 },
          { name: "Semester - 6", fee: 8000.00 }
        ]
      },
      {
        name: "Yoga Studies & Sports",
        code: "B.A. - 09A",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Bachelor of Commerce (B.Com)",
    code: "B.Com.",
    duration: "6 - Semester's",
    icon: "fa-chart-line",
    subcourses: [
      {
        name: "B.Com.",
        code: "B.Com. - 13",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 }
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Bachelor of Computer Application (B.C.A.)",
    code: "B.C.A. - 17",
    duration: "6 - Semester's",
    icon: "fa-laptop-code",
    subcourses: [
      {
        name: "B.C.A.",
        code: "B.C.A. - 17",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 }
        ]
      }
    ]
  },
  {
    id: 7,
    name: "Bachelor of Social Work (B.S.W.)",
    code: "B.S.W. - 19",
    duration: "6 - Semester's",
    icon: "fa-hands-helping",
    subcourses: [
      {
        name: "B.S.W.",
        code: "B.S.W. - 19",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 }
        ]
      }
    ]
  },
  {
    id: 8,
    name: "Bachelor of Hotel Management (B.H.M.)",
    code: "B.H.M. - 22",
    duration: "8 - Semester's",
    icon: "fa-hotel",
    subcourses: [
      {
        name: "B.H.M.",
        code: "B.H.M. - 22",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 },
          { name: "Semester - 7", fee: 10000.00 },
          { name: "Semester - 8", fee: 10000.00 }
        ]
      }
    ]
  },
  {
    id: 9,
    name: "Bachelor of Business Administration (B.B.A.)",
    code: "B.B.A. - 23",
    duration: "6 - Semester's",
    icon: "fa-briefcase",
    subcourses: [
      {
        name: "B.B.A.",
        code: "B.B.A. - 23",
        semesters: [
          { name: "Semester - 1", fee: 10000.00 },
          { name: "Semester - 2", fee: 10000.00 },
          { name: "Semester - 3", fee: 10000.00 },
          { name: "Semester - 4", fee: 10000.00 },
          { name: "Semester - 5", fee: 10000.00 },
          { name: "Semester - 6", fee: 10000.00 }
        ]
      }
    ]
  },
  {
    id: 10,
    name: "Bachelor of Library & Information Science",
    code: "B.Lib - 11",
    duration: "2 - Semester's",
    icon: "fa-book",
    subcourses: [
      {
        name: "B.Lib.",
        code: "B.Lib - 11",
        semesters: [
          { name: "Semester - 1", fee: 6000.00 },
          { name: "Semester - 2", fee: 6000.00 }
        ]
      }
    ]
  },
  {
    id: 11,
    name: "Diploma in Computer Application (D.C.A.)",
    code: "D.C.A. - 15",
    duration: "2 - Semester's",
    icon: "fa-desktop",
    subcourses: [
      {
        name: "D.C.A.",
        code: "D.C.A. - 15",
        semesters: [
          { name: "Semester - 1", fee: 6000.00 },
          { name: "Semester - 2", fee: 6000.00 }
        ]
      }
    ]
  },
  {
    id: 12,
    name: "Post Graduation Diploma in Computer Application (P.G.D.C.A.)",
    code: "P.G.D.C.A. - 16",
    duration: "2 - Semester's",
    icon: "fa-microchip",
    subcourses: [
      {
        name: "P.G.D.C.A.",
        code: "P.G.D.C.A. - 16",
        semesters: [
          { name: "Semester - 1", fee: 7500.00 },
          { name: "Semester - 2", fee: 7500.00 }
        ]
      }
    ]
  },
  {
    id: 13,
    name: "Bachelor of Technology (B.Tech.)",
    code: "B.Tech. - 24",
    duration: "8 - Semester's",
    icon: "fa-cogs",
    subcourses: [
      {
        name: "Electrical",
        code: "B.Tech. - 24(A)",
        semesters: [
          { name: "Semester - 1", fee: 20000.00 },
          { name: "Semester - 2", fee: 20000.00 },
          { name: "Semester - 3", fee: 20000.00 },
          { name: "Semester - 4", fee: 20000.00 },
          { name: "Semester - 5", fee: 20000.00 },
          { name: "Semester - 6", fee: 20000.00 },
          { name: "Semester - 7", fee: 20000.00 },
          { name: "Semester - 8", fee: 20000.00 }
        ]
      },
      {
        name: "Computer Science",
        code: "B.Tech. - 24(B)",
        semesters: [
          { name: "Semester - 1", fee: 20000.00 },
          { name: "Semester - 2", fee: 20000.00 },
          { name: "Semester - 3", fee: 20000.00 },
          { name: "Semester - 4", fee: 20000.00 },
          { name: "Semester - 5", fee: 20000.00 },
          { name: "Semester - 6", fee: 20000.00 },
          { name: "Semester - 7", fee: 20000.00 },
          { name: "Semester - 8", fee: 20000.00 }
        ]
      },
      {
        name: "Electrical & Electronics",
        code: "B.Tech. - 24(C)",
        semesters: [
          { name: "Semester - 1", fee: 20000.00 },
          { name: "Semester - 2", fee: 20000.00 },
          { name: "Semester - 3", fee: 20000.00 },
          { name: "Semester - 4", fee: 20000.00 },
          { name: "Semester - 5", fee: 20000.00 },
          { name: "Semester - 6", fee: 20000.00 },
          { name: "Semester - 7", fee: 20000.00 },
          { name: "Semester - 8", fee: 20000.00 }
        ]
      },
      {
        name: "Mining",
        code: "B.Tech. - 24(D)",
        semesters: [
          { name: "Semester - 1", fee: 20000.00 },
          { name: "Semester - 2", fee: 20000.00 },
          { name: "Semester - 3", fee: 20000.00 },
          { name: "Semester - 4", fee: 20000.00 },
          { name: "Semester - 5", fee: 20000.00 },
          { name: "Semester - 6", fee: 20000.00 },
          { name: "Semester - 7", fee: 20000.00 },
          { name: "Semester - 8", fee: 20000.00 }
        ]
      },
      {
        name: "Civil",
        code: "B.Tech. - 24(E)",
        semesters: [
          { name: "Semester - 1", fee: 20000.00 },
          { name: "Semester - 2", fee: 20000.00 },
          { name: "Semester - 3", fee: 20000.00 },
          { name: "Semester - 4", fee: 20000.00 },
          { name: "Semester - 5", fee: 20000.00 },
          { name: "Semester - 6", fee: 20000.00 },
          { name: "Semester - 7", fee: 20000.00 },
          { name: "Semester - 8", fee: 20000.00 }
        ]
      },
      {
        name: "Chemical Engineering",
        code: "B.Tech. - 24(F)",
        semesters: [
          { name: "Semester - 1", fee: 20000.00 },
          { name: "Semester - 2", fee: 20000.00 },
          { name: "Semester - 3", fee: 20000.00 },
          { name: "Semester - 4", fee: 20000.00 },
          { name: "Semester - 5", fee: 20000.00 },
          { name: "Semester - 6", fee: 20000.00 },
          { name: "Semester - 7", fee: 20000.00 },
          { name: "Semester - 8", fee: 20000.00 }
        ]
      },
      {
        name: "Electronics & Tele-Communication Engineering",
        code: "B.Tech. - 24(G)",
        semesters: [
          { name: "Semester - 1", fee: 20000.00 },
          { name: "Semester - 2", fee: 20000.00 },
          { name: "Semester - 3", fee: 20000.00 },
          { name: "Semester - 4", fee: 20000.00 },
          { name: "Semester - 5", fee: 20000.00 },
          { name: "Semester - 6", fee: 20000.00 },
          { name: "Semester - 7", fee: 20000.00 },
          { name: "Semester - 8", fee: 20000.00 }
        ]
      },
      {
        name: "Electronics Engineering",
        code: "B.Tech. - 24(H)",
        semesters: [
          { name: "Semester - 1", fee: 20000.00 },
          { name: "Semester - 2", fee: 20000.00 },
          { name: "Semester - 3", fee: 20000.00 },
          { name: "Semester - 4", fee: 20000.00 },
          { name: "Semester - 5", fee: 20000.00 },
          { name: "Semester - 6", fee: 20000.00 },
          { name: "Semester - 7", fee: 20000.00 },
          { name: "Semester - 8", fee: 20000.00 }
        ]
      },
      {
        name: "Environmental Science",
        code: "M.Sc. - 08P",
        semesters: [
          { name: "Semester - 1", fee: 20000.00 },
          { name: "Semester - 2", fee: 20000.00 },
          { name: "Semester - 3", fee: 20000.00 },
          { name: "Semester - 4", fee: 20000.00 },
          { name: "Semester - 5", fee: 20000.00 },
          { name: "Semester - 6", fee: 20000.00 },
          { name: "Semester - 7", fee: 20000.00 },
          { name: "Semester - 8", fee: 20000.00 }
        ]
      }
    ]
  },
  {
    id: 14,
    name: "Certificate Course in Life Management & Bhagwat Gita",
    code: "Certificate - 30",
    duration: "1 - Semester's",
    icon: "fa-certificate",
    subcourses: [
      {
        name: "Certificate",
        code: "Certificate - 30",
        semesters: [
          { name: "Semester - 1", fee: 6000.00 }
        ]
      }
    ]
  },
  {
    id: 15,
    name: "Certificate Course in Yoga & Science",
    code: "Certificate",
    duration: "1 - Semester's",
    icon: "fa-spa",
    subcourses: [
      {
        name: "Certificate",
        code: "Certificate - 31",
        semesters: [
          { name: "Semester - 1", fee: 6000.00 }
        ]
      }
    ]
  },
  {
    id: 16,
    name: "Certificate Course in Sanskrit Language",
    code: "Certificate - 32",
    duration: "1 - Semester's",
    icon: "fa-language",
    subcourses: [
      {
        name: "Certificate",
        code: "Certificate - 32",
        semesters: [
          { name: "Semester - 1", fee: 6000.00 }
        ]
      }
    ]
  },
  {
    id: 17,
    name: "Diploma in Hotel Management (D.H.M.)",
    code: "D.H.M. - 21",
    duration: "4 - Semester's",
    icon: "fa-utensils",
    subcourses: [
      {
        name: "D.H.M.",
        code: "D.H.M. - 21",
        semesters: [
          { name: "Semester - 1", fee: 8000.00 },
          { name: "Semester - 2", fee: 8000.00 },
          { name: "Semester - 3", fee: 8000.00 },
          { name: "Semester - 4", fee: 8000.00 }
        ]
      }
    ]
  },
  {
    id: 18,
    name: "Post Graduation Diploma in Business Management (P.G.D.B.M.)",
    code: "P.G.D.B.M.",
    duration: "2 - Semester's",
    icon: "fa-user-tie",
    subcourses: [
      {
        name: "P.G.D.B.M.",
        code: "P.G.D.B.M. - 25",
        semesters: [
          { name: "Semester - 1", fee: 20000.00 },
          { name: "Semester - 2", fee: 20000.00 }
        ]
      }
    ]
  },
  {
    id: 19,
    name: "Master of Science (M.Sc.) (Food Nutrition And Dietetics)",
    code: "M.Sc. - 06",
    duration: "4 - Semester's",
    icon: "fa-leaf",
    subcourses: [
      {
        name: "Food Nutrition And Dietetics",
        code: "M.Sc. - 06",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      }
    ]
  },
  {
    id: 20,
    name: "Master of Science (M.Sc.)",
    code: "M.Sc. - 08",
    duration: "4 - Semester's",
    icon: "fa-microscope",
    subcourses: [
      {
        name: "Physics",
        code: "M.Sc. - 08A",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Chemistry",
        code: "M.Sc. - 08B",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Botany",
        code: "M.Sc. - 08C",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Mathematics",
        code: "M.Sc. - 08D",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Zoology",
        code: "M.Sc. - 08E",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Statistics",
        code: "M.Sc. - 08F",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Electronics",
        code: "M.Sc. - 08E",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Bio-Chemistry",
        code: "M.Sc. - 08H",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Bio-Science",
        code: "M.Sc. - 08I",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Bio-Physics",
        code: "M.Sc. - 08J",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Bio-Technology",
        code: "M.Sc. - 08H",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Anthropology",
        code: "M.Sc. - 08K",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Criminology & Forensic",
        code: "M.Sc. - 08L",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Microbiology",
        code: "M.Sc. - 08M",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Forestry & Wildlife",
        code: "M.Sc. - 08N",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Computer Science & Information Technology",
        code: "M.Sc. - 08O",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Nanotechnology",
        code: "M.Sc. - 08Q",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Environmental Science",
        code: "M.Sc. - 08P",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Food Science & Nutrition",
        code: "M.Sc. - 08R",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Yoga & Nephropathy",
        code: "M.Sc. - 08S",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Computer Application",
        code: "M.Sc. - 08T",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Home Science",
        code: "M.Sc. - 08Q",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Geography",
        code: "M.Sc. - 08V",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Nutrition Exercise & Sports",
        code: "M.Sc. - 08W",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Library Science",
        code: "M.Sc. - 08X",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Biological Science",
        code: "M.Sc. - 08Y",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Astronomy",
        code: "M.Sc. - 08Z",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Neuroscience",
        code: "M.Sc. - 08AA",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Cell Biology & Genetic",
        code: "M.Sc. - 08BB",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Plant Science",
        code: "M.Sc. - 08CC",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Soil Science",
        code: "M.Sc. - 08DD",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      },
      {
        name: "Material Science",
        code: "M.Sc. - 08EE",
        semesters: [
          { name: "Semester - 1", fee: 18000.00 },
          { name: "Semester - 2", fee: 18000.00 },
          { name: "Semester - 3", fee: 18000.00 },
          { name: "Semester - 4", fee: 18000.00 }
        ]
      }
    ]
  },
  {
    id: 21,
    name: "Master of Arts (M.A.)",
    code: "M.A. - 10",
    duration: "4 - Semester's",
    icon: "fa-pen-fancy",
    subcourses: [
      {
        name: "English",
        code: "M.A. - 10A",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Hindi",
        code: "M.A. - 10B",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Sanskrit",
        code: "M.A. - 10C",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Philosophy",
        code: "M.A. - 10D",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "History",
        code: "M.A. - 10E",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Political Science",
        code: "M.A. - 10F",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Geography",
        code: "M.A. - 10G",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Psychology",
        code: "M.A. - 10H",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Sociology",
        code: "M.A. - 10I",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Social Work",
        code: "M.A. - 10J",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Journalism & Mass Communication",
        code: "M.A. - 10K",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Library Science",
        code: "M.A. - 10L",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Yoga Studies & Sports",
        code: "M.A. - 10M",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Education",
        code: "M.A. - 10N",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      },
      {
        name: "Fashion Design",
        code: "M.A. - 10(O)",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      }
    ]
  },
  {
    id: 22,
    name: "Master of Library & Information Science",
    code: "M.Lib - 12",
    duration: "2 - Semester's",
    icon: "fa-book-reader",
    subcourses: [
      {
        name: "M.Lib.",
        code: "M.Lib. - 12",
        semesters: [
          { name: "Semester - 1", fee: 7500.00 },
          { name: "Semester - 2", fee: 7500.00 }
        ]
      }
    ]
  },
  {
    id: 23,
    name: "Master of Commerce (M.Com)",
    code: "M.Com. - 18",
    duration: "4 - Semester's",
    icon: "fa-coins",
    subcourses: [
      {
        name: "Accounting & Auditing",
        code: "M.Com. - 18A",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Business Economics",
        code: "M.Com. - 18B",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Business Management",
        code: "M.Com. - 18C",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Taxation",
        code: "M.Com. - 18D",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Financial Accounting",
        code: "M.Com. - 18E",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Banking",
        code: "M.Com. - 18F",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Computer Application Banking & Finance",
        code: "M.Com. - 18G",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Cost Accounting",
        code: "M.Com. - 18H",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Business Management Business Regulatory Framework",
        code: "M.Com. - 18(I)",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Industrial Organisation",
        code: "M.Com. - 18J",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Taxation",
        code: "M.Com. - 18K",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "E-Commerce",
        code: "M.Com. - 18L",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Banking & Insurance",
        code: "M.Com. - 18M",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Management Accounting",
        code: "M.Com. - 18N",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Commerce",
        code: "M.Com. - 18O",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Management Accounting",
        code: "M.Com. - 18P",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      },
      {
        name: "Business Mathematics",
        code: "M.Com. - 18R",
        semesters: [
          { name: "Semester - 1", fee: 14000.00 },
          { name: "Semester - 2", fee: 14000.00 },
          { name: "Semester - 3", fee: 14000.00 },
          { name: "Semester - 4", fee: 14000.00 }
        ]
      }
    ]
  },
  {
    id: 24,
    name: "Master of Business Administration (M.B.A.)",
    code: "M.B.A. - 24",
    duration: "4 - Semester's",
    icon: "fa-building",
    subcourses: [
      {
        name: "Business Management",
        code: "M.B.A. - 24A",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Rural Management",
        code: "M.B.A. - 24B",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Security & Portfolio Management",
        code: "M.B.A. - 24C",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Hospital Management",
        code: "M.B.A. - 24D",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Financial Management",
        code: "M.B.A. - 24E",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Food Service Management",
        code: "M.B.A. - 24F",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Hotel Management & Catering Technology",
        code: "M.B.A. - 24G",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Event Management",
        code: "M.B.A. - 24H",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Industrial Management",
        code: "M.B.A. - 24I",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Hospitality Management",
        code: "M.B.A. - 24J",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Disaster Management",
        code: "M.B.A. - 24K",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Marketing & Sales Management",
        code: "M.B.A. - 24L",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Export Management",
        code: "M.B.A. - 24M",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Advertising Management",
        code: "M.B.A. - 24N",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Foreign Trade Management",
        code: "M.B.A. - 24O",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Production Management",
        code: "M.B.A. - 24P",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Travel & Tourism Management",
        code: "M.B.A. - 24Q",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Human Resource Management",
        code: "M.B.A. - 24R",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Retail Trade Management",
        code: "M.B.A. - 24S",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Digital Marketing Management",
        code: "M.B.A. - 24T",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      },
      {
        name: "Banking Management",
        code: "M.B.A. - 24U",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      }
    ]
  },
  {
    id: 25,
    name: "Master of Computer Application (M.C.A.)",
    code: "M.C.A.",
    duration: "4 - Semester's",
    icon: "fa-laptop",
    subcourses: [
      {
        name: "M.C.A.",
        code: "M.C.A. - 18",
        semesters: [
          { name: "Semester - 1", fee: 25000.00 },
          { name: "Semester - 2", fee: 25000.00 },
          { name: "Semester - 3", fee: 25000.00 },
          { name: "Semester - 4", fee: 25000.00 }
        ]
      }
    ]
  },
  {
    id: 26,
    name: "Master of Social Work (M.S.W.)",
    code: "M.S.W. - 20",
    duration: "4 - Semester's",
    icon: "fa-people-carry",
    subcourses: [
      {
        name: "M.S.W.",
        code: "M.S.W. - 20",
        semesters: [
          { name: "Semester - 1", fee: 12000.00 },
          { name: "Semester - 2", fee: 12000.00 },
          { name: "Semester - 3", fee: 12000.00 },
          { name: "Semester - 4", fee: 12000.00 }
        ]
      }
    ]
  },
  {
    id: 27,
    name: "Diploma in Hotel Management (D.H.M.)",
    code: "D.H.M. - 21",
    duration: "4 - Semester's",
    icon: "fa-concierge-bell",
    subcourses: [
      {
        name: "D.H.M.",
        code: "D.H.M. - 21",
        semesters: [
          { name: "Semester - 1", fee: 90000.00 },
          { name: "Semester - 2", fee: 90000.00 },
          { name: "Semester - 3", fee: 90000.00 },
          { name: "Semester - 4", fee: 90000.00 }
        ]
      }
    ]
  },
  {
    id: 28,
    name: "Master of Philosophy",
    code: "M.Phil. - 28",
    duration: "1.5 - Year's",
    icon: "fa-graduation-cap",
    subcourses: [
      {
        name: "M.Phil.",
        code: "M.PHIL. - 28",
        semesters: [
          { name: "Year - 1", fee: 50000.00 }
        ]
      }
    ]
  },
  {
    id: 29,
    name: "Doctor of Philosophy",
    code: "Ph.D. - 29",
    duration: "3 - Year's",
    icon: "fa-user-graduate",
    subcourses: [
      {
        name: "Hindi",
        code: "Ph.D. - 29A",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "English",
        code: "Ph.D. - 29B",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Geography",
        code: "Ph.D. - 29C",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Sociology",
        code: "Ph.D. - 29D",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Social Work",
        code: "Ph.D. - 29E",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Management",
        code: "Ph.D. - 29F",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Commerce",
        code: "Ph.D. - 29G",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Mass Communication",
        code: "Ph.D. - 29N",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Yoga",
        code: "Ph.D. - 29I",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Education",
        code: "Ph.D. - 29J",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Physics",
        code: "Ph.D. - 29K",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Chemistry",
        code: "Ph.D. - 29L",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Bio-Technology",
        code: "Ph.D. - 29M",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Bio-Chemistry",
        code: "Ph.D. - 29H",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Zoology",
        code: "Ph.D. - 29O",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Mathematics",
        code: "Ph.D. - 29P",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Botany",
        code: "Ph.D. - 29Q",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Arts",
        code: "Ph.D. - 29R",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      },
      {
        name: "Science",
        code: "Ph.D. - 29S",
        semesters: [
          { name: "Year - 1", fee: 90000.00 },
          { name: "Year - 2", fee: 90000.00 },
          { name: "Year - 3", fee: 90000.00 }
        ]
      }
    ]
  }
];
