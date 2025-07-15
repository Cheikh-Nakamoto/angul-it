#!/bin/bash

git add .

git commit -m "$1"

git push

read -p "Voulez-vous acheminer ces modifications vers GitHub ? (y/n): " opt

if [ "$opt" == "y" ]; then

    read -p "Entrer votre lien de dépôt GitHub (ou appuyez sur Entrée si déjà configuré) : " opt1

    if [ -n "$opt1" ]; then
        git remote add github "$opt1"
        git push github
        echo "✈️ Commit Git et GitHub effectué avec succès. ✈️"
    else
        git push github
        echo "✈️ Commit Git et GitHub effectué avec succès. ✈️"
    fi
else
    echo "✈️ Commit dans Git effectué avec succès ✈️."
fi