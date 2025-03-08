embed
<drac2>


cc = 'Mana'
exploding_cvar = 'InitiatedManaExplosion'
killing_cvar = 'KillingFromMana'
ch = character()
is_wizard = ch.levels.get('Wizard') > 0

level_max_mana = (3 if is_wizard else 2) * ch.max_hp

if not ch.cc_exists(cc):
  ch.create_cc(cc, 0, level_max_mana, None, None, None, None, cc, 'Mana', level_max_mana)

if ch.get_cvar(exploding_cvar) is None:
  ch.edit_cc(name = cc, maxVal = level_max_mana)

new_max_mana = ch.get_cc_max(cc)
new_mana = ch.get_cc(cc)
arg = '&1&' if len(&ARGS&) > 0 else None

zhizn_race = 'zhizn dragon'
variant_race = 'variant wyrmling'

Title = ''
Description = ''


def is_float(value):
  if value is None:
	  return False
  try:
	  float(value)
	  return True
  except:
	  return False


def is_int(x):
	try:
		a = float(x)
		b = int(a)
	except (TypeError, ValueError):
		return False
	else:
		return a == b

def get_turns_left(x):
  return f"**Turns Before Exploding**\n{ceil((25.0 + 2.0 * x) ** 0.5 * 0.1 - 0.5)}"

def get_current_mana():
  return f"**Mana**\n**{int(new_mana) if is_int(new_mana) else new_mana}** / **{int(new_max_mana) if is_int(new_max_mana) else new_max_mana}**"


if len(&ARGS&) == 0:
  Title += f"{ch.name}'s Mana"
  Description += get_current_mana()

elif arg == 'delete':
  ch.delete_cc(cc)
  ch.delete_cvar(exploding_cvar)
  ch.delete_cvar(killing_cvar)
  Title += f"{ch.name} is Mana-less"
  Description += f"The **Mana** counter has been removed. {ch.name} is incapable of using Mana anymore. If they were exploding, they are not anymore."
  return

elif arg == 'reset':
  ch.delete_cvar(exploding_cvar)
  ch.delete_cvar(killing_cvar)
  ch.edit_cc(name = cc, maxVal = level_max_mana)
  ch.set_cc(cc, level_max_mana)
  new_max_mana += ch.get_cc_max(cc) - new_max_mana
  new_mana += ch.get_cc(cc) - new_mana
  Title += f"{ch.name}'s Mana Reset"
  Description += f"The Mana counter has been reset and any variables have been deleted. If they were exploding, they are not anymore.\n\n" + get_current_mana()
  return

elif is_float(arg):
  value = float(arg)

  if value == 0:
	Title += f"{ch.name}'s Mana"
	Description += get_current_mana()

  else:
	sign = '+' if value > 0 else '-'
	amount = abs(value)
	Title += f"{ch.name}'s Mana ({sign}{int(amount) if is_int(amount) else amount})"
	ch.mod_cc(cc, value)
	new_mana += ch.get_cc(cc) - new_mana
	Description += get_current_mana()

elif arg == 'kill':
  damage_string = f"They have taken **{ch.max_hp + ch.hp + ch.temp_hp}** damage from losing all their Mana."

  ch.set_cc(cc, 0)
  ch.set_hp(-ch.max_hp)
  ch.set_temp_hp(0)
  ch.set_cvar(killing_cvar, 'True')

  if ch.race.lower() == zhizn_race:
	Description += f"\n\n**{ch.name} Has Died**\n" + damage_string

  elif ch.race.lower() == variant_race:
	Description += f"\n\n**{ch.name} Has Exploded With {int(new_max_mana) if is_int(new_max_mana) else new_max_mana} Mana**\nEverybody in the nearby vicinity will feel their wrath! " + damage_string

  else:
	Description += f"\n\n**{ch.name} Turns Into A [Zhizn Dragon](https://www.dndbeyond.com/races/1693501-zhizn-dragon)**\nTime for a new sheet! " + damage_string

elif arg == 'explode':
  if ch.get_cvar(exploding_cvar) is None:
	ch.edit_cc(name = cc, maxVal = 10 * new_max_mana)
	new_max_mana += ch.get_cc_max(cc) - new_max_mana

	ch.set_cc(cc, new_max_mana)
	new_mana += ch.get_cc(cc) - new_mana

	ch.set_cvar(exploding_cvar, 'True')

	Title += f"{ch.name} Mana Rush"
	Description += f"\n\n**{ch.name} Has Exhausted All Mana**\nTheir Mana has temporarily increased tenfold. Every turn they lose **100 \* Turns** Mana until they exhaust entirely. When they exhaust what's left they will explode. When they explode run the `!mana kill` command.\n\n" + get_current_mana()
  else:
	Title += f"{ch.name} Mana Rush"
	Description += f"\n\n**{ch.name} Is Exhausting Remaining Mana**\nTheir Mana has temporarily increased tenfold. Every turn they lose **100 \* Turns** Mana until they exhaust entirely. When they exhaust what's left they will explode. When they explode run the `!mana kill` command.\n\n" + get_current_mana()

elif arg == 'list':
  Title += f"Mana Commands"
  Description += """`!mana`
Automatically update your mana stats from level and health, display your current and max mana

`!mana list`
See this list of commands

`!mana reset`
Resets mana and any character variables

`!mana delete`
Removes the mana counter and explosion variable from a character

`!mana kill`
- If a **Variant Wyrmling** then character explodes and health is set to -max health
- If a **Zhizn Dragon** then character dies and health is set to -max health
- If anybody else, prompt DM to turn character into **Zhizn Dragon**

`!mana explode`
- Set character variable `Initiated Mana Explosion` to true
- Set current mana to 10 * max
- When at 0 prompt user to run the `!mana kill` command

`!mana <number>`
Add to current mana, capping at max, if at or below 0 mana then:
- if `Initiated Mana Explosion` then prompt DM to begin exploding people and set character health to -max health
- else then prompt user to use the `!mana kill` command"""
  return

if ch.get_cvar(killing_cvar):
  ch.delete_cvar(killing_cvar)
  return

if new_mana <= 0:
  Description += f"\n\n**{ch.name} Exhausted All Mana**\n"

  if ch.race.lower() == zhizn_race:
	Description += f"As a [**Zhizn Dragon**](https://www.dndbeyond.com/races/1693501-zhizn-dragon) they will now die; run the `!mana kill` command."

  elif ch.race.lower() == variant_race:
	if ch.get_cvar(exploding_cvar) is None:
	  Description += f"As a [**Variant Wyrmling**](https://www.dndbeyond.com/races/1693500-variant-wyrmling) they will now begin to explode; run the `!mana explode` command."
	else:
	  Description += f"Will now explode; run the `!mana kill` command."
  else:
	Description += f"They will now turn into a [**Zhizn Dragon**](https://www.dndbeyond.com/races/1693501-zhizn-dragon); run the `!mana kill` command."

elif ch.get_cvar(exploding_cvar) is None:
  footer_prefix = f'\n\nIf **{ch.name}** exhausts all of their Mana they '

  if ch.race.lower() == zhizn_race:
	Description += footer_prefix + 'will die.'

  elif ch.race.lower() == variant_race:
	Description += footer_prefix + 'will explode.'

  else:
	Description += footer_prefix + 'will turn into a [**Zhizn Dragon**](https://www.dndbeyond.com/races/1693501-zhizn-dragon).'

else:
  Description += "\n\n" + get_turns_left(new_mana)

</drac2>
-title "{{Title}}"
-desc "{{Description}}"
-thumb "{{image}}"

------------------------------------------------------------------------------------------------------------------------------------------------------------------------

embed
<drac2>

cc_stamina = 'Stamina'
cc_stamina_move = 'Stamina_Movement'
ch = character()

Title = ''
Description = ''

def is_float(value):
	if value is None:
		return False
	try:
		float(value)
		return True
	except:
		return False

def is_int(x):
	try:
		a = float(x)
		b = int(a)
	except (TypeError, ValueError):
		return False
	else:
		return a == b

if not ch.cc_exists(cc_stamina):
	stamina_max = 100
	ch.create_cc(
		name = cc_stamina,
		minVal = 0,
		maxVal = stamina_max,
		reset = None,
		dispType = None,
		reset_to = None,
		reset_by = None,
		title = cc_stamina,
		desc = 'Stamina',
		initial_value = stamina_max
	)

if not ch.cc_exists(cc_stamina_move):
	movement_max = 25
	ch.create_cc(
		name = cc_stamina_move,
		minVal = 0,
		maxVal = None,
		reset = None,
		dispType = None,
		reset_to = None,
		reset_by = None,
		title = cc_stamina_move,
		desc = 'Stamina',
		initial_value = movement_max
	)


new_stamina_move = ch.get_cc(cc_stamina_move)
new_stamina = ch.get_cc(cc_stamina)
new_max_stamina = ch.get_cc_max(cc_stamina)
arg = '&1&' if len(&ARGS&) > 0 else None

def get_current_stamina():
	return f"**Stamina**\n**{int(new_stamina) if is_int(new_stamina) else new_stamina}** / **{int(new_max_stamina) if is_int(new_max_stamina) else new_max_stamina}**"

if len(&ARGS&) != 0:
	value = float(arg)
	if value != 0:
		sign = '+' if value > 0 else '-'
		amount = abs(value)
		Title += f"{ch.name}'s Movement Cost ({sign}{int(amount) if is_int(amount) else amount})"
		ch.mod_cc(cc_stamina_move, value)
		new_stamina_move = ch.get_cc(cc_stamina_move)

if new_stamina < new_stamina_move:
	if Title == '':
		Title += f"{ch.name} Can't Move"
	Description += 'It\'s too far... I can\'t go on...\n\n'
	Description += get_current_stamina()
else:
	if Title == '':
		Title += f"{ch.name} Moves"
	ch.mod_cc(cc_stamina, -new_stamina_move)
	Description += f"{ch.name} uses {new_stamina_move} Stamina to move\n\n"
	Description += get_current_stamina()

</drac2>
-title "{{Title}}"
-desc "{{Description}}"
-thumb "{{image}}"



-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

embed
<drac2>

cc_stamina = 'Stamina'
cc_stamina_move = 'Stamina_Movement'
ch = character()

Title = ''
Description = ''

def is_float(value):
	if value is None:
		return False
	try:
		float(value)
		return True
	except:
		return False

def is_int(x):
	try:
		a = float(x)
		b = int(a)
	except (TypeError, ValueError):
		return False
	else:
		return a == b

stamina_max = 100
ch.create_cc(
	name = cc_stamina,
	minVal = 0,
	maxVal = stamina_max,
	reset = None,
	dispType = None,
	reset_to = None,
	reset_by = None,
	title = cc_stamina,
	desc = 'Stamina',
	initial_value = stamina_max
)


movement_max = 25
ch.create_cc(
	name = cc_stamina_move,
	minVal = 0,
	maxVal = 1e100,
	reset = None,
	dispType = None,
	reset_to = None,
	reset_by = None,
	title = cc_stamina_move,
	desc = 'Stamina Movement',
	initial_value = movement_max
)

</drac2>
-title "{{Title}}"
-desc "{{Description}}"
-thumb "{{image}}"