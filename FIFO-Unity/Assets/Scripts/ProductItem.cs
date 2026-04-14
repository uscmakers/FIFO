public class ProductItem
{
    public Time addedAt; 
    public string brand;
    public string category; // make into enum if finite options?
    public Date expirationDate;
    public string imageURL;
    public string name;
    public Time updatedAt; 
}

public class Date
{
    int month;
    int day;
    int year;
    public Date(int month, int day, int year)
    {
        this.month = month;
        this.day = day;
        this.year = year;
    }

    // can add different ways of displaying date in the future?
    public override string ToString()
    {
        return AddZeros(month, 2) + '/' + AddZeros(day, 2) + '/' + AddZeros(year, 4);
    }

    protected string AddZeros(int value, int numChars)
    {
        string s = value.ToString();
        string zeros = "";
        for(int i=s.Length; i<numChars; i++)
        {
            zeros += '0';
        }
        return zeros + s;
    }
}

public class Time : Date
{
    int hour;
    int minute;
    int second;
    public Time(int month, int day, int year, int hour, int minute, int second) : base(month, day, year)
    {
        this.hour = hour;
        this.minute = minute;
        this.second = second;
    }

    // TODO ToString() method
}