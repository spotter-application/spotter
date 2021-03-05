import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle } from '../../core';
import icon from './icon.png';
export class ConverterPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Converter';

  async onQuery(query: string): Promise<SpotterOption[]> {
       
    try {
       const splitted = query.split(" ",4)
       const convertFromAmount = Number(splitted[0])
       const convertFromCurrencyType = splitted[1].toUpperCase()
       const convertToCurrencyType = splitted[3].toUpperCase()
       
       if(splitted.length==4 && convertToCurrencyType.length==3)
       {
        var result=0
        const data = await fetch(`https://api.exchangeratesapi.io/latest?base=${convertFromCurrencyType}&symbols=${convertToCurrencyType}`)
        const json = data.json()
        const r = json.then(data =>{
            const rate =  Number(data.rates[convertToCurrencyType])
            const result = rate*convertFromAmount
            return [{
                    title: `${convertToCurrencyType} ${result}`,
                    icon,
                    action: () =>{},
                }]
            }
        )
        return r        
    }
}  
     catch (_) {   
      return [];
    }
  }


}
