export function getFallbackAssistantReply(message: string): string {
  const question = message.toLowerCase();

  if (/\b(hi|hello|hey|hallo|guten tag)\b/.test(question)) {
    return 'Hi! I can help with meal ideas, protein, balanced portions, snacks, and general nutrition basics. What would you like to know?';
  }

  if (/vegetarian|vegan|meatless|fleischlos/.test(question)) {
    return 'For a balanced meat-free meal, combine a protein source such as beans, lentils, tofu, tempeh, eggs, or Greek yogurt with vegetables and a filling carbohydrate like potatoes, rice, or whole grains.';
  }

  if (/protein|eiweiß|eiweiss/.test(question)) {
    return 'Practical protein choices include eggs, Greek yogurt, cottage cheese, fish, chicken, tofu, beans, and lentils. Spreading protein across your meals is usually easier than trying to get most of it at dinner.';
  }

  if (/breakfast|frühstück|fruehstueck/.test(question)) {
    return 'A simple balanced breakfast could be oats or whole-grain toast, Greek yogurt or eggs for protein, and fruit. Choose portions that fit your hunger and daily target.';
  }

  if (/snack/.test(question)) {
    return 'Useful snack combinations pair protein or healthy fats with fibre: fruit with yogurt, apple with peanut butter, vegetables with hummus, or a small handful of nuts.';
  }

  if (/lose weight|weight loss|abnehmen/.test(question)) {
    return 'For gradual weight loss, focus on a modest calorie deficit, regular protein, fibre-rich foods, and portions you can maintain. Your longer-term weight trend matters more than a single day.';
  }

  if (/gain weight|weight gain|zunehmen/.test(question)) {
    return 'For gradual weight gain, add consistent energy through larger portions or an extra snack. Calorie-dense options such as nuts, nut butter, olive oil, oats, dairy, and avocado can help without making every meal very large.';
  }

  if (/water|hydration|trinken/.test(question)) {
    return 'Water is a good everyday choice. Your needs vary with body size, weather, and activity, so drink regularly and increase fluids when exercising or in hot weather.';
  }

  return 'A balanced meal usually combines a protein source, vegetables or fruit, a carbohydrate source, and some healthy fat. If you tell me the meal or goal you are thinking about, I can give you a more specific suggestion.';
}
