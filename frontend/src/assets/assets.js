import logo from "./Logo.png";
import search_icon from "./search_icon.svg";
import remove_icon from "./remove_icon.svg";
import arrow_right_icon_colored from "./arrow_right_icon_colored.png";
import star_icon from "./star_icon.svg";
import star_dull_icon from "./star_dull_icon.svg";
import cart_icon from "./cart_icon.svg";
import nav_cart_icon from "./nav_cart_icon.svg";
import add_icon from "./add_icon.svg";
import refresh_icon from "./refresh_icon.svg";
import product_list_icon from "./product_list_icon.svg";
import order_icon from "./order_icon.svg";
import upload_area from "./upload_area.png";
import profile_icon from "./profile_icon.png";
import menu_icon from "./menu_icon.svg";
import delivery_truck_icon from "./delivery_truck_icon.jpg";
import leaf_icon from "./leaf_icon.jpg";
import coin_icon from "./coin_icon.jpg";
import box_icon from "./box_icon.png";
import trust_icon from "./trust_icon.jpg";
import black_arrow_icon from "./black_arrow_icon.svg";
import white_arrow_icon from "./white_arrow_icon.svg";
import add_address_image from "./add_address_image.png";
import main_banner_bg from "./main_banner_bg.jpg";
import main_banner_bg_sm from "./main_banner_bg_sm.jpg";
import cocktails_mixers from "./Cocktails_and_Mixers.jpg";
import champagne from "./Champagne.jpg";
import gin from "./Gin.jpg";
import rum from "./Rum.jpg";
import vodka from "./Vodka.jpg";
import whiskey from "./Whiskey.jpg";
import beer from "./Beer.jpg";
import wine from "./Wine.jpg";
import Johnnie_Walker_Black_Label_750ml from "./Johnnie_Walker_Black_Label_750ml.png";
import Johnnie_Walker_Black_Label_750ml_2 from "./Johnnie_Walker_Black_Label_750ml_2.png";
import Johnnie_Walker_Black_Label_750ml_3 from "./Johnnie_Walker_Black_Label_750ml_3.png";
import Johnnie_Walker_Black_Label_750ml_4 from "./Johnnie_Walker_Black_Label_750ml_4.png";
import Smirnoff_Vodka_750ml from "./Smirnoff_Vodka_750ml.png";
import Bacardi_White_Rum_750ml from "./Bacardi_White_Rum_750ml.png";
import Bombay_Sapphire_Gin_750ml from "./Bombay_Sapphire_Gin_750ml.png";
import Moet_Chandon_Brut_750ml from "./Moët_and_Chandon_Brut_750ml.png";
import Corona_Extra_6_Pack from "./Corona_Extra_6_Pack.png";
import Jacobs_Creek_Shiraz_750ml from "./Jacob’s_Creek_Shiraz_750ml.png";
import Margarita_Mix_1L from "./Margarita_Mix_1L.png";
import bottom_banner_image from "./bottom_banner_image.jpeg";
import bottom_banner_image_sm from "./bottom_banner_image_sm.jpeg";

export const assets = {
  logo,
  search_icon,
  remove_icon,
  arrow_right_icon_colored,
  star_icon,
  star_dull_icon,
  cart_icon,
  nav_cart_icon,
  add_icon,
  refresh_icon,
  product_list_icon,
  order_icon,
  upload_area,
  profile_icon,
  menu_icon,
  delivery_truck_icon,
  leaf_icon,
  coin_icon,
  trust_icon,
  black_arrow_icon,
  white_arrow_icon,
  add_address_image,
  box_icon,
  main_banner_bg,
  main_banner_bg_sm,
  bottom_banner_image,
  bottom_banner_image_sm,
};

export const categories = [
  {
    name: "Gin",
    path: "Gin",
    image: gin,
    bgColor: "#EAF5F2",
 },
  {
    name: "Rum",
    path: "Rum",
    image: rum,
    bgColor: "#F6EEE3",
  },
  {
    name: "Vodka",
    path: "Vodka",
    image: vodka,
    bgColor: "#F1F5FF", 
  },
  {
    name: "Champagne",
    path: "Champagne",
    image: champagne,
    bgColor: "#FFF7E6",
  },
  {
    name: "Whiskey",
    path: "Whiskey",
    image: whiskey,
    bgColor: "#F8F0E3",
  },
  {
    name: "Beer",
    path: "Beer",
    image: beer,
    bgColor: "#FEF4D7",
  },
  {
    name: "Wine",
    path: "Wine",
    image: wine,
    bgColor: "#FBEFF2",
  },
  {
    name: "Cocktails & Mixers",
    path: "Cocktails-mixers",
    image: cocktails_mixers,
    bgColor: "#FDEDEC",
  }
]

export const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { text: "Home", url: "#" },
      { text: "Best Sellers", url: "#" },
      { text: "New Arrivals", url: "#" },
      { text: "Contact Us", url: "#" },
      { text: "FAQs", url: "#" },
    ],
  },
  {
    title: "Need Help?",
    links: [
      { text: "Delivery Information", url: "#" },
      { text: "Return & Refund Policy", url: "#" },
      { text: "Payment Methods", url: "#" },
      { text: "Track Your Order", url: "#" },
      { text: "Customer Support", url: "#" },
    ],
  },
  {
    title: "Follow Us",
    links: [
      { text: "Instagram", url: "#" },
      { text: "Facebook", url: "#" },
      { text: "Twitter", url: "#" },
      { text: "YouTube", url: "#" },
    ],
  },
];

export const features = [
  {
    icon: delivery_truck_icon,
    title: "Fast Delivery",
    description: "Liquor delivered to your doorstep in under 60 minutes.",
  },
  {
    icon: leaf_icon,
    title: "Wide Selection",
    description: "Choose from 100+ local and international brands.",
  },
  {
    icon: coin_icon,
    title: "Great Prices",
    description: "Affordable luxury with exciting offers.",
  },
  {
    icon: trust_icon,
    title: "Trusted Service",
    description: "Safe & legal delivery from verified vendors.",
  },
];

export const dummyProducts = [
  {
    _id: "liq001",
    name: "Johnnie Walker Black Label 750ml",
    category: "Whiskey",
    price: 3500,
    offerPrice: 3200,
    image: [Johnnie_Walker_Black_Label_750ml, Johnnie_Walker_Black_Label_750ml_2, Johnnie_Walker_Black_Label_750ml_3, Johnnie_Walker_Black_Label_750ml_4],
    description: [
      "12-year-old Scotch whisky",
      "Smooth, smoky flavor",
      "Ideal for celebrations",
    ],
    createdAt: "2025-06-30T12:00:00.000Z",
    updatedAt: "2025-06-30T12:00:00.000Z",
    inStock: true,
  },
  {
    _id: "liq002",
    name: "Smirnoff Vodka 750ml",
    category: "Vodka",
    price: 2200,
    offerPrice: 1999,
    image: [Smirnoff_Vodka_750ml],
    description: [
      "Triple distilled for purity",
      "Perfect for cocktails or neat",
    ],
    createdAt: "2025-06-30T12:00:00.000Z",
    updatedAt: "2025-06-30T12:00:00.000Z",
    inStock: true,
  },
  {
    _id: "liq003",
    name: "Bacardi White Rum 750ml",
    category: "Rum",
    price: 2100,
    offerPrice: 1950,
    image: [Bacardi_White_Rum_750ml],
    description: [
      "Light-bodied white rum",
      "Perfect for Mojitos and Daiquiris",
    ],
    createdAt: "2025-06-30T12:00:00.000Z",
    updatedAt: "2025-06-30T12:00:00.000Z",
    inStock: true,
  },
  {
    _id: "liq004",
    name: "Bombay Sapphire Gin 750ml",
    category: "Gin",
    price: 2800,
    offerPrice: 2600,
    image: [Bombay_Sapphire_Gin_750ml],
    description: [
      "Premium London Dry Gin",
      "Infused with 10 botanicals",
    ],
    createdAt: "2025-06-30T12:00:00.000Z",
    updatedAt: "2025-06-30T12:00:00.000Z",
    inStock: true,
  },
  {
    _id: "liq005",
    name: "Moët & Chandon Brut 750ml",
    category: "Champagne",
    price: 8500,
    offerPrice: 8000,
    image: [Moet_Chandon_Brut_750ml],
    description: [
      "French luxury champagne",
      "Fine bubbles, elegant taste",
    ],
    createdAt: "2025-06-30T12:00:00.000Z",
    updatedAt: "2025-06-30T12:00:00.000Z",
    inStock: true,
  },
  {
    _id: "liq006",
    name: "Corona Extra 6 Pack",
    category: "Beer",
    price: 1500,
    offerPrice: 1400,
    image: [Corona_Extra_6_Pack],
    description: [
      "Imported Mexican lager",
      "Crisp and refreshing",
    ],
    createdAt: "2025-06-30T12:00:00.000Z",
    updatedAt: "2025-06-30T12:00:00.000Z",
    inStock: true,
  },
  {
    _id: "liq007",
    name: "Jacob’s Creek Shiraz 750ml",
    category: "Wine",
    price: 2800,
    offerPrice: 2600,
    image: [Jacobs_Creek_Shiraz_750ml],
    description: [
      "Rich and bold Australian red wine",
      "Notes of berries and spices",
    ],
    createdAt: "2025-06-30T12:00:00.000Z",
    updatedAt: "2025-06-30T12:00:00.000Z",
    inStock: true,
  },
  {
    _id: "liq008",
    name: "Margarita Mix 1L",
    category: "Cocktails & Mixers",
    price: 650,
    offerPrice: 600,
    image: [Margarita_Mix_1L],
    description: [
      "Ready-to-serve mixer",
      "Great with tequila and ice",
    ],
    createdAt: "2025-06-30T12:00:00.000Z",
    updatedAt: "2025-06-30T12:00:00.000Z",
    inStock: true,
  },
];

export const dummyAddress = [
  {
    _id: "abcd1234",
    userId: "user5678",
    firstName: "Liquor",
    lastName: "Shopper",
    email: "shopper@example.com",
    street: "45 Bar Lane",
    city: "Colombo",
    state: "Western",
    zipCode: 10100,
    country: "Sri Lanka",
    phone: "0771234567",
  },
];

export const dummyOrders = [
  {
    _id: "order001",
    userId: "user5678",
    items: [
      {
        product: dummyProducts[0],
        quantity: 1,
        _id: "item001",
      },
      {
        product: dummyProducts[2],
        quantity: 2,
        _id: "item002",
      },
    ],
    amount: 7100,
    address: dummyAddress[0],
    status: "Processing",
    paymentType: "Online",
    isPaid: true,
    createdAt: "2025-06-30T12:30:00.000Z",
    updatedAt: "2025-06-30T12:35:00.000Z",
  },
  {
    _id: "order002",
    userId: "user5678",
    items: [
      {
        product: dummyProducts[3],
        quantity: 2,
        _id: "item004",
      },
    ],
    amount: 5200,
    address: dummyAddress[0],
    status: "Processing",
    paymentType: "COD",
    isPaid: true,
    createdAt: "2025-06-30T12:30:00.000Z",
    updatedAt: "2025-06-30T12:35:00.000Z",
  },
];




