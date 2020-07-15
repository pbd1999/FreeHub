# Script to concatenate profanity word sets

prof_input = open("input.txt", "r")
prof_list = open("profanities.txt", "w")

all_prof = set()

for word in prof_input:
    all_prof.add(word.strip())

prof_input.close()


prof_list.write("[\n")
for unique in sorted(all_prof):
    prof_list.write("\"" + unique + "\",\n")
prof_list.write("]")
