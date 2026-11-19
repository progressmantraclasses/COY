import { Profile } from '../discover/profile.types';

const photo = (g: 'women' | 'men', n: number) =>
  `https://randomuser.me/api/portraits/${g}/${n}.jpg`;

/**
 * 32 mock profiles. `likedMe: true` means this person has already (secretly)
 * liked the logged-in user, so liking them back during a demo creates a match.
 * 9 of the 32 have liked the user; they are spread through the list and the
 * feed is shuffled anyway, so their position reveals nothing.
 */
export const SEED_PROFILES: Profile[] = [
  { id: 'p01', name: 'Aanya', age: 21, photo: photo('women', 44), city: 'Delhi', college: 'Miranda House', bio: 'Will trade notes for chai. Overthinks playlists, underthinks plans.', interests: ['Indie music', 'Chai', 'Debating'], likedMe: true },
  { id: 'p02', name: 'Kabir', age: 23, photo: photo('men', 32), city: 'Bengaluru', bio: 'Backend dev by day, bad guitarist by night. Ask me about my sourdough.', interests: ['Guitar', 'Baking', 'Trekking'], likedMe: false },
  { id: 'p03', name: 'Meera', age: 22, photo: photo('women', 65), city: 'Mumbai', college: 'St. Xavier’s', bio: 'Film club president. Will judge you (lovingly) by your Letterboxd.', interests: ['Cinema', 'Photography', 'Thrifting'], likedMe: false },
  { id: 'p04', name: 'Arjun', age: 24, photo: photo('men', 75), city: 'Pune', bio: 'Weekend cyclist, weekday spreadsheet wizard.', interests: ['Cycling', 'Finance', 'Coffee'], likedMe: false },
  { id: 'p05', name: 'Ishita', age: 20, photo: photo('women', 12), city: 'Pilani', college: 'BITS Pilani', bio: 'Robotics nerd who still cries at Pixar movies.', interests: ['Robotics', 'Animation', 'Sketching'], likedMe: true },
  { id: 'p06', name: 'Vihaan', age: 22, photo: photo('men', 11), city: 'Hyderabad', college: 'IIIT Hyderabad', bio: 'Competitive programmer. Competitive about board games too.', interests: ['Board games', 'Coding', 'Biryani'], likedMe: false },
  { id: 'p07', name: 'Saanvi', age: 23, photo: photo('women', 33), city: 'Chennai', bio: 'Classical dancer with an unhealthy love for filter coffee.', interests: ['Bharatanatyam', 'Coffee', 'Poetry'], likedMe: false },
  { id: 'p08', name: 'Rohan', age: 25, photo: photo('men', 46), city: 'Gurugram', bio: 'Product manager. I make roadmaps; you pick the restaurant.', interests: ['Food', 'Travel', 'Podcasts'], likedMe: true },
  { id: 'p09', name: 'Diya', age: 21, photo: photo('women', 26), city: 'Bengaluru', college: 'Christ University', bio: 'Psychology major. Yes, I am analysing your bio right now.', interests: ['Psychology', 'Yoga', 'Books'], likedMe: false },
  { id: 'p10', name: 'Aditya', age: 22, photo: photo('men', 52), city: 'Delhi', college: 'IIT Delhi', bio: 'Rock climbing, late-night maggi, and slightly too many side projects.', interests: ['Climbing', 'Startups', 'Maggi'], likedMe: false },
  { id: 'p11', name: 'Kiara', age: 24, photo: photo('women', 57), city: 'Goa', bio: 'Marine biologist. Will absolutely make you go snorkelling.', interests: ['Ocean', 'Scuba', 'Sunsets'], likedMe: false },
  { id: 'p12', name: 'Neel', age: 23, photo: photo('men', 18), city: 'Ahmedabad', college: 'NID', bio: 'Product designer. Kerning keeps me up at night.', interests: ['Design', 'Typography', 'Kites'], likedMe: true },
  { id: 'p13', name: 'Tara', age: 20, photo: photo('women', 79), city: 'Manipal', college: 'Manipal University', bio: 'Med student surviving on caffeine and K-dramas.', interests: ['K-dramas', 'Medicine', 'Baking'], likedMe: false },
  { id: 'p14', name: 'Ayaan', age: 21, photo: photo('men', 64), city: 'Kolkata', college: 'Jadavpur University', bio: 'Quizzer, football fan, and part-time fish-fry critic.', interests: ['Quizzing', 'Football', 'Food'], likedMe: false },
  { id: 'p15', name: 'Anika', age: 22, photo: photo('women', 90), city: 'Mumbai', college: 'NMIMS', bio: 'Marketing student. I will write your dating bio for one samosa.', interests: ['Marketing', 'Stand-up', 'Samosas'], likedMe: false },
  { id: 'p16', name: 'Reyansh', age: 24, photo: photo('men', 85), city: 'Jaipur', bio: 'Architect who sketches every haveli he walks past.', interests: ['Architecture', 'Sketching', 'History'], likedMe: false },
  { id: 'p17', name: 'Myra', age: 23, photo: photo('women', 21), city: 'Pune', college: 'Symbiosis', bio: 'Law student. I win arguments and also board games.', interests: ['Law', 'Scrabble', 'Running'], likedMe: true },
  { id: 'p18', name: 'Vivaan', age: 22, photo: photo('men', 27), city: 'Chandigarh', bio: 'Gym in the morning, gaming at night, mom’s rajma on Sundays.', interests: ['Fitness', 'Gaming', 'Rajma'], likedMe: false },
  { id: 'p19', name: 'Zara', age: 21, photo: photo('women', 50), city: 'Lucknow', bio: 'Urdu poetry and street food walks — pick one, or both.', interests: ['Poetry', 'Street food', 'Calligraphy'], likedMe: false },
  { id: 'p20', name: 'Krish', age: 23, photo: photo('men', 41), city: 'Bengaluru', college: 'IISc', bio: 'Physics PhD. I can explain black holes but not my feelings.', interests: ['Physics', 'Astronomy', 'Jazz'], likedMe: false },
  { id: 'p21', name: 'Avni', age: 22, photo: photo('women', 68), city: 'Indore', bio: 'Sarafa bazaar tour guide (self-appointed).', interests: ['Food', 'Travel', 'Vlogging'], likedMe: true },
  { id: 'p22', name: 'Ishaan', age: 24, photo: photo('men', 9), city: 'Mumbai', bio: 'Musician. Currently producing an album nobody asked for.', interests: ['Music production', 'Vinyl', 'Cricket'], likedMe: false },
  { id: 'p23', name: 'Riya', age: 20, photo: photo('women', 15), city: 'Delhi', college: 'SRCC', bio: 'Economics student, amateur florist, professional overplanner.', interests: ['Economics', 'Flowers', 'Planning'], likedMe: false },
  { id: 'p24', name: 'Advait', age: 21, photo: photo('men', 60), city: 'Vellore', college: 'VIT', bio: 'Cloud certifications and cloud-watching, both.', interests: ['Cloud', 'Hiking', 'Anime'], likedMe: false },
  { id: 'p25', name: 'Pari', age: 23, photo: photo('women', 37), city: 'Kochi', bio: 'Backwaters, books, and banana chips. In that order.', interests: ['Books', 'Kayaking', 'Cooking'], likedMe: false },
  { id: 'p26', name: 'Shaurya', age: 25, photo: photo('men', 36), city: 'Noida', bio: 'Startup founder. Yes, it is another AI app.', interests: ['Startups', 'AI', 'Badminton'], likedMe: true },
  { id: 'p27', name: 'Navya', age: 22, photo: photo('women', 8), city: 'Hyderabad', college: 'ISB', bio: 'MBA by day, Carnatic vocalist by night.', interests: ['Music', 'Strategy', 'Dosa'], likedMe: false },
  { id: 'p28', name: 'Dhruv', age: 21, photo: photo('men', 22), city: 'Dehradun', bio: 'Mountain kid. Will take you on a sunrise hike, snacks included.', interests: ['Hiking', 'Camping', 'Photography'], likedMe: false },
  { id: 'p29', name: 'Sara', age: 24, photo: photo('women', 82), city: 'Shillong', bio: 'Plays bass in a band you have definitely not heard of.', interests: ['Bass', 'Live music', 'Coffee'], likedMe: true },
  { id: 'p30', name: 'Yash', age: 23, photo: photo('men', 71), city: 'Surat', bio: 'Textile engineer with strong opinions on fabric.', interests: ['Fashion', 'Cricket', 'Street food'], likedMe: false },
  { id: 'p31', name: 'Inaya', age: 21, photo: photo('women', 3), city: 'Bhopal', college: 'NLIU', bio: 'Debater, lake-side walker, collector of bookmarks.', interests: ['Debating', 'Books', 'Walking'], likedMe: false },
  { id: 'p32', name: 'Aarav', age: 22, photo: photo('men', 3), city: 'Bengaluru', college: 'PES University', bio: 'Drummer. Taps on every table, apologies in advance.', interests: ['Drums', 'Cafés', 'F1'], likedMe: false },
];
