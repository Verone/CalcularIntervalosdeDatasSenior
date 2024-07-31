// ==UserScript==
// @name         Calcular Intervalos de Datas
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Captura e calcula intervalos de datas no formato especificado
// @author       Danilo Oliveira
// @match        https://platform.senior.com.br/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/luxon/2.3.2/luxon.min.js
// @updateURL    https://github.com/Verone/CalcularIntervalosdeDatasSenior/blob/main/script.js
// @downloadURL  https://github.com/Verone/CalcularIntervalosdeDatasSenior/blob/main/script.js
// ==/UserScript==

(function() {
    'use strict';

    // Espera o carregamento completo da página
    window.addEventListener('load', () => {
        // Adiciona um atraso para garantir que todos os elementos dinâmicos sejam carregados
        setTimeout(() => {
            // Define a expressão XPath
            var xpath = '//*[@id="ui-panel-0-content"]/div/div/div/div[4]/div';

            // Executa a expressão XPath
            var resultado = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

            // Obtém o nó resultante
            var elemento = resultado.singleNodeValue;

            // Captura o texto contido no elemento
            var texto = elemento ? elemento.innerText : ''; // ou elemento.textContent

            // Função para calcular a diferença em horas e minutos usando luxon
            function calcularDiferenca(date1, date2) {
                const diff = date1.diff(date2, ['hours', 'minutes']);
                return { horas: diff.hours, minutos: diff.minutes };
            }

            // Função para somar horas e minutos
            function somarTempos(tempos) {
                var totalHoras = 0;
                var totalMinutos = 0;

                tempos.forEach(tempo => {
                    totalHoras += tempo.horas;
                    totalMinutos += tempo.minutos;
                });

                totalHoras += Math.floor(totalMinutos / 60);
                totalMinutos = totalMinutos % 60;

                return { horas: totalHoras, minutos: totalMinutos };
            }

            // Função para converter string de data para objeto DateTime do luxon
            function parseDateString(dateString) {
                const [datePart, timePart] = dateString.split(' - ');
                return luxon.DateTime.fromFormat(`${datePart} ${timePart}`, 'dd/MM/yyyy HH:mm:ss', { zone: 'local' });
            }

            // Função para arredondar minutos
            function arredondarMinutos(horas, minutos) {
                let totalMinutos = horas * 60 + minutos;
                let minutosArredondados = Math.round(totalMinutos);
                let horasArredondadas = Math.floor(minutosArredondados / 60);
                minutosArredondados = minutosArredondados % 60;
                return { horas: horasArredondadas, minutos: minutosArredondados };
            }

            // Captura a data atual
            var agora = luxon.DateTime.local();

            // Filtra e processa as datas do dia atual
            var linhas = texto.split('\n');
            var datasDoDia = [];
            linhas.forEach(linha => {
                var data = parseDateString(linha);
                if (data.hasSame(agora, 'day')) {
                    datasDoDia.push(data);
                }
            });

            // Ordena as datas do dia atual em ordem crescente
            datasDoDia.sort((a, b) => a - b);

            // Calcula os intervalos entre as datas e soma os tempos
            var intervalosTrabalho = [];
            var intervalosAlmoco = [];

            for (var i = 1; i < datasDoDia.length; i += 2) {
                intervalosTrabalho.push(calcularDiferenca(datasDoDia[i], datasDoDia[i - 1]));
            }

            // Adiciona o intervalo entre a última data e a data atual
            if (datasDoDia.length % 2 !== 0) {
                intervalosTrabalho.push(calcularDiferenca(agora, datasDoDia[datasDoDia.length - 1]));
            }

            // Calcula os intervalos de almoço
            for (var i = 2; i < datasDoDia.length; i += 2) {
                intervalosAlmoco.push(calcularDiferenca(datasDoDia[i], datasDoDia[i - 1]));
            }

            // Soma todos os intervalos de trabalho
            var totalTrabalho = somarTempos(intervalosTrabalho);

            // Soma todos os intervalos de almoço
            var totalAlmoco = somarTempos(intervalosAlmoco);

            // Arredonda os resultados
            totalTrabalho = arredondarMinutos(totalTrabalho.horas, totalTrabalho.minutos);
            totalAlmoco = arredondarMinutos(totalAlmoco.horas, totalAlmoco.minutos);

            // Cria uma div para exibir o resultado
            var resultadoDiv = document.createElement('div');
            resultadoDiv.style.textAlign = 'center';
            resultadoDiv.style.bottom = '10px';
            resultadoDiv.style.right = '10px';
            resultadoDiv.style.padding = '10px';
            resultadoDiv.style.backgroundColor = 'white';
            resultadoDiv.style.border = '1px solid black';
            resultadoDiv.style.zIndex = 1000; // Garantir que a div fique sobre outros elementos

            // Adiciona o resultado na div
            resultadoDiv.innerHTML = `
                Total de horas trabalhadas: ${totalTrabalho.horas} horas e ${totalTrabalho.minutos} minutos<br>
                Total de horas de almoço: ${totalAlmoco.horas} horas e ${totalAlmoco.minutos} minutos
            `;

            // Adiciona a div ao final do body
            document.body.appendChild(resultadoDiv);
        }, 3000); // Atraso de 3 segundos
    });
})();
